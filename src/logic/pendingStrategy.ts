import { TokenDetails } from "types";
import web3 from "web3";

import BN from "bn.js";
import Decimal from "decimal.js";

const { toBN } = web3.utils;

import {
  DecoderData,
  FundingDetails,
  calculateFundsFromTxData,
  pricesToRange,
  PriceRange,
} from "./utils/calculateFunds";
import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";

// const logger = getLogger('pending-strategy');

class PendingStrategy {
  transactionHash: string;
  safeAddresses: string[];
  bracketAddresses: string[];
  prices: Decimal[];
  nonce: number;
  baseTokenId: number;
  quoteTokenId: number;
  baseTokenAddress: string;
  quoteTokenAddress: string;
  baseTokenDetails: TokenDetails;
  quoteTokenDetails: TokenDetails;
  baseFunding: Decimal;
  quoteFunding: Decimal;
  owner: string;
  created: Date;
  block: any;
  transactionData: DecoderData;
  priceRange: PriceRange;
  bracketsWithBaseToken: string[];
  bracketsWithQuoteToken: string[];

  constructor(pendingStrategyTransaction: Record<string, any>) {
    this.transactionHash = pendingStrategyTransaction.safeTxHash;
    this.transactionData = pendingStrategyTransaction.dataDecoded;
    this.nonce = pendingStrategyTransaction.nonce;
    this.created = new Date(pendingStrategyTransaction.submissionDate);
  }

  /**
   * Check if a transaction includes any indication that it is for a
   * pending strategy deployment and not something else.
   *
   * @param pendingStrategyTransaction
   * @returns {Boolean} - Is the transaction for a strategy deployment?
   */
  static isPendingStrategyTx(
    pendingStrategyTransaction: Record<string, any>
  ): boolean {
    // FIXME: Sorry, this is awful. Needs to be fixed later.
    // Either implement the walkTransaction as a generic tx graph class, or come
    // up with something cooler.
    const txDataStr = JSON.stringify(pendingStrategyTransaction.dataDecoded);

    return (
      txDataStr.includes("placeOrder") ||
      txDataStr.includes("deployFleet") ||
      txDataStr.includes("deployFleetWithNonce")
    );
  }

  async findFromPendingTransactions(
    context: ContractInteractionContextProps
  ): Promise<void> {
    const fundingDetails: FundingDetails = calculateFundsFromTxData(
      this.transactionData
    );
    this.baseTokenId = fundingDetails.baseTokenId;
    this.quoteTokenId = fundingDetails.quoteTokenId;

    this.prices = fundingDetails.bracketPrices;
    this.bracketAddresses = fundingDetails.bracketAddresses;

    // Prefetch before we initialize tradingHelper
    await Promise.all([
      context.getArtifact("IProxy"),
      context.getArtifact("GnosisSafe"),
      context.getArtifact("MultiSend"),
      context.getArtifact("GnosisSafeProxyFactory"),
      context.getArtifact("FleetFactory"),
      context.getArtifact("FleetFactoryDeterministic"),
      context.getArtifact("BatchExchange"),
    ]);

    const batchExchangeContract = await context.getDeployed("BatchExchange");

    if (this.baseTokenId == null || this.quoteTokenId == null) {
      console.error(`Missing tokenIds for pending strategy`, this);
      return;
    }

    const [tokenBaseAddress, tokenQuoteAddress] = await Promise.all([
      batchExchangeContract.methods
        .tokenIdToAddressMap(this.baseTokenId)
        .call(),
      batchExchangeContract.methods
        .tokenIdToAddressMap(this.quoteTokenId)
        .call(),
    ]);
    this.baseTokenAddress = tokenBaseAddress;
    this.quoteTokenAddress = tokenQuoteAddress;

    this.baseTokenDetails = await context.getErc20Details(
      this.baseTokenAddress
    );
    this.quoteTokenDetails = await context.getErc20Details(
      this.quoteTokenAddress
    );

    const bracketsWithBaseToken =
      fundingDetails.bracketsByToken[this.baseTokenAddress] || [];
    const bracketsWithQuoteToken =
      fundingDetails.bracketsByToken[this.quoteTokenAddress] || [];

    this.bracketsWithBaseToken = bracketsWithBaseToken;
    this.bracketsWithQuoteToken = bracketsWithQuoteToken;

    const baseFundingWei = Object.keys(bracketsWithBaseToken).reduce(
      (acc: BN, bracketAddress: string) => {
        return acc.iadd(bracketsWithBaseToken[bracketAddress]);
      },
      toBN(0)
    );
    this.baseFunding = new Decimal(baseFundingWei.toString()).div(
      Math.pow(10, this.baseTokenDetails.decimals)
    );

    const quoteFundingWei = Object.keys(bracketsWithQuoteToken).reduce(
      (acc: BN, bracketAddress: string) => {
        return acc.iadd(bracketsWithQuoteToken[bracketAddress]);
      },
      toBN(0)
    );
    this.quoteFunding = new Decimal(quoteFundingWei.toString()).div(
      Math.pow(10, this.quoteTokenDetails.decimals)
    );
    this.priceRange = pricesToRange(
      this.prices,
      this.baseTokenDetails,
      this.quoteTokenDetails
    );
    console.log(this);
  }
}

export default PendingStrategy;
