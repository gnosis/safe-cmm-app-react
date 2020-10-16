import { TokenDetails } from "types";
import web3GLib from "web3";
import Decimal from "decimal.js";
import BN from "bn.js";

import {
  calculateFundsFromEvents,
  pricesToRange,
  PriceRange,
} from "./utils/calculateFunds";
import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";

const { toBN } = web3GLib.utils;

const globalResolvedTokenPromises = {};

export interface Bracket {
  address: string;
  events: any[];
  deposits: DepositEvent[];
  withdrawRequests: WithdrawEvent[];
  withdraws: any[];
}

export interface DepositEvent {
  amount: string; // BN string
  token: string;
  batchId: number;
}

export interface WithdrawEvent {
  amount: string;
  batchId: number;
  created: Date;
}

class Strategy {
  transactionHash: string;
  safeAddresses: string[];
  brackets: Bracket[];
  prices: Decimal[];
  startBlockNumber: number;
  baseTokenId: number;
  quoteTokenId: number;
  baseTokenAddress: string;
  quoteTokenAddress: string;
  baseTokenDetails: TokenDetails;
  quoteTokenDetails: TokenDetails;
  tokenQuoteBalances: Record<string, BN>;
  tokenBaseBalances: Record<string, BN>;
  baseFunding: string;
  quoteFunding: string;
  owner: string;
  created: Date;
  block: any;
  lastWithdrawRequestEvent: WithdrawEvent;
  lastWithdrawClaimEvent: any;
  priceRange: PriceRange;

  constructor(fleetDeployEvent: Record<string, any>) {
    this.transactionHash = fleetDeployEvent.transactionHash;
    this.startBlockNumber = fleetDeployEvent.blockNumber;
    this.safeAddresses = fleetDeployEvent.returnValues.fleet;
    this.owner = fleetDeployEvent.returnValues.owner;
    this.lastWithdrawRequestEvent = null;
    this.lastWithdrawClaimEvent = null;
  }

  async fetchAllPossibleInfo(
    context: ContractInteractionContextProps
  ): Promise<void> {
    // Find creation date by block number
    this.block = await context.web3Instance.eth.getBlock(this.startBlockNumber);
    this.created = new Date(this.block.timestamp * 1000);

    this.prices = [];

    // Find all placed orders, to determine the brackets, token pairs and funding
    const batchExchangeContract = await context.getDeployed("BatchExchange");

    const orderBatchIds = [];
    const withdrawRequestBlocks = {};
    const allWithdrawClaims = [];

    const allBracketOrderEvents = [];
    const brackets = await Promise.all(
      this.safeAddresses.map(
        async (bracketAddress): Promise<Bracket> => {
          // Bracket orders find the tokens used for the strategy
          const bracketOrderEvents = await batchExchangeContract.getPastEvents(
            "OrderPlacement",
            {
              fromBlock: this.startBlockNumber - 1,
              filter: { owner: bracketAddress },
            }
          );

          allBracketOrderEvents.push(...bracketOrderEvents);

          // Bracket Deposits find the funding used for the strategy
          const bracketDepositEvents = await batchExchangeContract.getPastEvents(
            "Deposit",
            {
              fromBlock: this.startBlockNumber - 1,
              filter: { user: bracketAddress },
            }
          );

          const withdrawClaims = await batchExchangeContract.getPastEvents(
            "Withdraw",
            {
              fromBlock: this.startBlockNumber - 1,
              filter: { user: bracketAddress },
            }
          );

          allWithdrawClaims.push(...withdrawClaims);

          let withdrawRequestsWithBlock: WithdrawEvent[] = [];
          if (bracketDepositEvents[0]) {
            const withdrawRequests = await batchExchangeContract.getPastEvents(
              "WithdrawRequest",
              {
                fromBlock: this.startBlockNumber - 1,
                filter: {
                  batchId: bracketDepositEvents[0].batchId,
                  user: bracketAddress,
                },
              }
            );

            withdrawRequestsWithBlock = await Promise.all(
              withdrawRequests.map(
                async (withdrawRequest): Promise<WithdrawEvent> => {
                  if (!withdrawRequestBlocks[withdrawRequest.blockNumber]) {
                    withdrawRequestBlocks[
                      withdrawRequest.blockNumber
                    ] = await context.web3Instance.eth.getBlock(
                      withdrawRequest.blockNumber
                    );
                  }

                  return {
                    amount: withdrawRequest.returnValues.amount,
                    batchId: parseInt(withdrawRequest.returnValues.batchId, 10),
                    created: new Date(
                      withdrawRequestBlocks[withdrawRequest.blockNumber]
                        .timestamp * 1000
                    ),
                  };
                }
              )
            );
          }

          const deposits = bracketDepositEvents.map(
            (event): DepositEvent => {
              return {
                token: event.returnValues.token,
                amount: event.returnValues.amount,
                batchId: event.returnValues.batchId,
              };
            }
          );

          deposits.forEach(({ batchId }): void => {
            if (!orderBatchIds.includes(batchId)) {
              orderBatchIds.push(batchId);
            }
          });

          return {
            address: bracketAddress,
            events: bracketOrderEvents,
            withdrawRequests: withdrawRequestsWithBlock,
            withdraws: withdrawClaims,
            deposits,
          };
        }
      )
    );

    if (allBracketOrderEvents.length > 0) {
      const fundingDetails = calculateFundsFromEvents(
        allBracketOrderEvents,
        this.safeAddresses
      );
      this.baseTokenId = fundingDetails.baseTokenId;
      this.quoteTokenId = fundingDetails.quoteTokenId;
      this.prices = fundingDetails.bracketPrices;
    }

    this.baseFunding = null;
    this.quoteFunding = null;

    if (this.baseTokenId != null) {
      if (!globalResolvedTokenPromises[this.baseTokenId]) {
        globalResolvedTokenPromises[
          this.baseTokenId
        ] = batchExchangeContract.methods
          .tokenIdToAddressMap(this.baseTokenId)
          .call();
      }
      this.baseTokenAddress = await globalResolvedTokenPromises[
        this.baseTokenId
      ];
      this.baseTokenDetails = await context.getErc20Details(
        this.baseTokenAddress
      );
    }
    if (this.quoteTokenId != null) {
      if (!globalResolvedTokenPromises[this.quoteTokenId]) {
        globalResolvedTokenPromises[
          this.quoteTokenId
        ] = batchExchangeContract.methods
          .tokenIdToAddressMap(this.quoteTokenId)
          .call();
      }
      this.quoteTokenAddress = await globalResolvedTokenPromises[
        this.quoteTokenId
      ];
      this.quoteTokenDetails = await context.getErc20Details(
        this.quoteTokenAddress
      );
    }
    const baseFundingBn = toBN(0);
    const quoteFundingBn = toBN(0);

    const baseBalances: Record<string, BN> = {};
    const quoteBalances: Record<string, BN> = {};

    if (brackets) {
      brackets.forEach((bracket): void => {
        bracket.deposits.forEach((deposit): void => {
          if (deposit.token === this.baseTokenAddress) {
            baseFundingBn.iadd(toBN(deposit.amount));
          }
          if (deposit.token === this.quoteTokenAddress) {
            quoteFundingBn.iadd(toBN(deposit.amount));
          }
        });
      });

      if (this.quoteTokenAddress && this.baseTokenAddress) {
        const quoteTokenContract = await context.getContract(
          "ERC20Detailed",
          this.quoteTokenAddress
        );
        const baseTokenContract = await context.getContract(
          "ERC20Detailed",
          this.baseTokenAddress
        );

        await Promise.all(
          brackets.map(
            async (bracket: Bracket): Promise<void> => {
              const quoteBalance = await quoteTokenContract.methods
                .balanceOf(bracket.address)
                .call();
              const baseBalance = await baseTokenContract.methods
                .balanceOf(bracket.address)
                .call();

              baseBalances[bracket.address] = baseBalance;
              quoteBalances[bracket.address] = quoteBalance;
            }
          )
        );
      }
    }

    this.baseFunding = baseFundingBn.toString();
    this.quoteFunding = quoteFundingBn.toString();

    this.tokenBaseBalances = baseBalances;
    this.tokenQuoteBalances = quoteBalances;

    this.lastWithdrawRequestEvent = brackets[0]?.withdrawRequests[0];
    this.lastWithdrawClaimEvent = allWithdrawClaims[0];

    this.prices.sort((a, b) => {
      if (a.eq(b)) return 0;
      return a.gt(b) ? 1 : -1;
    });
    this.priceRange = pricesToRange(
      this.prices,
      this.baseTokenDetails,
      this.quoteTokenDetails
    );
    this.brackets = brackets;
  }
}

export default Strategy;
