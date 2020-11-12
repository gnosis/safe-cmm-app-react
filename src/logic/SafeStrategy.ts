import getLogger from "utils/logger";

import {
  DecoderNode,
  flattenMultiSend,
  TransactionMethodCall,
} from "./utils/flattenMultiSend";

import { BaseStrategy, Bracket, IStrategy } from "./IStrategy";
import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";
import { SetterOrUpdater } from "recoil";
import { StrategyState } from "types";
import { filter } from "lodash";
import BN from "bn.js";
import Decimal from "decimal.js";
import { getTokenDetailsById } from "./utils/getTokenDetailsById";

const logger = getLogger("safe-strategy");

export interface PendingStrategySafeTransaction {
  safeTxHash: string;
  dataDecoded: DecoderNode;
  to: string;
  value: string;
  data: string;
  operation: number;
  gasToken: string;
  safeTxGas: number;
  baseGas: number;
  gasPrice: string;
  refundReceiver: string;
  nonce: number;
  submissionDate: string;
  executionDate: string;
  modified: string;
  blockNumber?: number;
  transactionHash?: string;
  executor?: string;
  isExecuted: boolean;
  isSuccessful?: boolean;
  ethGasPrice?: string;
  gasUsed?: string;
  fee?: string;
  origin: string;
  confirmationsRequired?: any;
  confirmations?: Record<string, any>[];
  signatures?: any;
}

export class SafeStrategy extends BaseStrategy implements IStrategy {
  public nonce: number;
  private setState: SetterOrUpdater<Partial<StrategyState>>;
  private methodCalls: TransactionMethodCall[];

  constructor(
    pendingTransactionLog: PendingStrategySafeTransaction,
    stateModifier: SetterOrUpdater<Partial<StrategyState>>
  ) {
    super();

    this.setState = stateModifier;

    this.transactionHash = pendingTransactionLog.safeTxHash;
    this.nonce = pendingTransactionLog.nonce;
    this.created = new Date(pendingTransactionLog.submissionDate);

    this.setState({
      transactionHash: this.transactionHash,
      created: this.created,
      // Strategies found from Safe Tx are always pending transactions
      status: "PENDING",
    });

    this.methodCalls = flattenMultiSend(pendingTransactionLog.dataDecoded);
  }

  async readFunding(context: ContractInteractionContextProps): Promise<void> {
    const tokenFundingPerBracket = {};

    const transfers = filter(this.methodCalls, { method: "transfer" });
    transfers.forEach((transferCall) => {
      const bracketAddress = transferCall.params.to;
      const tokenAddress = transferCall.target; // This is delegateCall to a token, so the target is the token address

      if (!tokenFundingPerBracket[bracketAddress]) {
        tokenFundingPerBracket[bracketAddress] = {};
      }

      if (!tokenFundingPerBracket[bracketAddress][tokenAddress]) {
        tokenFundingPerBracket[bracketAddress][tokenAddress] = new BN(0);
      }

      tokenFundingPerBracket[bracketAddress][tokenAddress].iadd(
        new BN(transferCall.params.value)
      );
    });

    const placeOrders = filter(this.methodCalls, { method: "placeOrder" });

    if (!placeOrders.length) {
      // This pending transaction is broken? It should always have orders
      logger.error(
        `${this.transactionHash} is invalid - no placeOrder methodcalls? Unplausible Tx`
      );
      return null;
    }

    // Pitfall: first order method call determines base and quote token. Might be wrong.
    this.baseTokenId = placeOrders[0].params.buyToken;
    this.quoteTokenId = placeOrders[0].params.sellToken;

    const prices = [];
    const sumBaseFunding = new BN(0);
    const sumQuoteFunding = new BN(0);

    placeOrders.forEach((placeOrderCall) => {
      const buyToken = placeOrderCall.params.buyToken;
      const sellAmount = placeOrderCall.params.value || "0";
      const buyAmount = placeOrderCall.params.value || "0";

      if (buyToken === this.baseTokenId) {
        prices.push(new Decimal(buyAmount).div(sellAmount));
        sumBaseFunding.iadd(new BN(buyAmount));
        sumQuoteFunding.iadd(new BN(sellAmount));
      } else {
        prices.push(new Decimal(sellAmount).div(buyAmount));
        sumBaseFunding.iadd(new BN(sellAmount));
        sumQuoteFunding.iadd(new BN(buyAmount));
      }
    });

    const batchExchangeContract = await context.getDeployed("BatchExchange");
    const [baseTokenDetails, quoteTokenDetails] = await Promise.all([
      getTokenDetailsById(
        context.getErc20Details,
        this.baseTokenId,
        batchExchangeContract
      ),
      getTokenDetailsById(
        context.getErc20Details,
        this.quoteTokenId,
        batchExchangeContract
      ),
    ]);

    this.baseTokenDetails = baseTokenDetails;
    this.quoteTokenDetails = quoteTokenDetails;

    const bracketFundingByToken = Object.keys(tokenFundingPerBracket).reduce(
      (acc, bracketAddress): any => {
        const tokenBalances = tokenFundingPerBracket[bracketAddress];
        const tokens = Object.keys(tokenBalances);

        tokens.forEach((tokenAddress) => {
          if (!acc[tokenAddress]) {
            acc[tokenAddress] = {};
          }

          if (!acc[tokenAddress][bracketAddress]) {
            acc[tokenAddress][bracketAddress] = new BN(0);
          }
          acc[tokenAddress][bracketAddress].iadd(
            new BN(tokenBalances[tokenAddress])
          );
        });
        return acc;
      },
      {}
    );

    const totalBaseFundingWei = new BN(0);
    const totalQuoteFundingWei = new BN(0);
    this.brackets = Object.keys(tokenFundingPerBracket).map(
      (bracketAddress: string): Bracket => {
        const bracketBaseFundingWei =
          bracketFundingByToken[this.baseTokenDetails.address][bracketAddress];
        totalBaseFundingWei.iadd(bracketBaseFundingWei);

        const bracketQuoteFundingWei =
          bracketFundingByToken[this.quoteTokenDetails.address][bracketAddress];
        totalQuoteFundingWei.iadd(bracketQuoteFundingWei);

        return {
          address: bracketAddress,
          // Pending transaction, balance is 0
          fundingBase: new Decimal(bracketBaseFundingWei.toString()).div(
            Math.pow(10, this.baseTokenDetails.decimals)
          ),
          fundingQuote: new Decimal(bracketQuoteFundingWei.toString()).div(
            Math.pow(10, this.quoteTokenDetails.decimals)
          ),
        };
      }
    );

    return null;
  }

  async readBalances(context: ContractInteractionContextProps): Promise<void> {
    return null;
  }

  async readStatus(context: ContractInteractionContextProps): Promise<void> {
    return null;
  }
}
