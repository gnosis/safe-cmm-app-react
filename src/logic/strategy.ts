import { TokenDetails } from "types";
import web3GLib from "web3";
import Decimal from "decimal.js";
import BN from "bn.js";
import { ZERO } from "@gnosis.pm/dex-js";

import makeArtifactLoader from "utils/makeFakeArtifacts";

import {
  calculateFundsFromEvents,
  pricesToRange,
  PriceRange,
} from "./utils/calculateFunds";
import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";
import { getWithdrawableAmount } from "@gnosis.pm/dex-contracts";

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

    const artifacts = makeArtifactLoader(context);
    const batchExchangeTC = artifacts.require("BatchExchange");
    const batchExchangeDeployedWithTruffle = await batchExchangeTC.deployed();

    const orderBatchIds = [];
    const withdrawRequestBlocks = {};
    const allWithdrawClaims = [];

    const allBracketOrderEvents = [];
    const brackets = await Promise.all(
      this.safeAddresses.map(
        async (bracketAddress): Promise<Bracket> => {
          // Bracket orders find the tokens used for the strategy
          const bracketOrderEventsPromise = batchExchangeContract.getPastEvents(
            "OrderPlacement",
            {
              fromBlock: this.startBlockNumber - 1,
              filter: { owner: bracketAddress },
            }
          );

          // Bracket Deposits find the funding used for the strategy
          const bracketDepositEventsPromise = batchExchangeContract.getPastEvents(
            "Deposit",
            {
              fromBlock: this.startBlockNumber - 1,
              filter: { user: bracketAddress },
            }
          );

          const withdrawClaimsPromise = batchExchangeContract.getPastEvents(
            "Withdraw",
            {
              fromBlock: this.startBlockNumber - 1,
              filter: { user: bracketAddress },
            }
          );

          const [
            bracketOrderEvents,
            bracketDepositEvents,
            withdrawClaims,
          ] = await Promise.all([
            bracketOrderEventsPromise,
            bracketDepositEventsPromise,
            withdrawClaimsPromise,
          ]);

          allBracketOrderEvents.push(...bracketOrderEvents);
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
        // Extremely unoptimized

        await Promise.all(
          brackets.map(
            async (bracket: Bracket): Promise<void> => {
              const [quoteBalance, quoteWithdrawAvailable] = await Promise.all([
                // In BatchExchange
                batchExchangeContract.methods
                  .getBalance(bracket.address, this.quoteTokenAddress)
                  .call(),
                // Available for Withdraw
                getWithdrawableAmount(
                  bracket.address,
                  this.quoteTokenAddress,
                  batchExchangeDeployedWithTruffle,
                  context.web3Instance
                ),
              ]);
              const [baseBalance, baseWithdrawAvailable] = await Promise.all([
                // In BatchExchange
                batchExchangeContract.methods
                  .getBalance(bracket.address, this.baseTokenAddress)
                  .call(),
                // Available for Withdraw
                getWithdrawableAmount(
                  bracket.address,
                  this.baseTokenAddress,
                  batchExchangeDeployedWithTruffle,
                  context.web3Instance
                ),
              ]);
              baseBalances[bracket.address] = new BN(baseBalance).add(
                baseWithdrawAvailable
              );
              quoteBalances[bracket.address] = new BN(quoteBalance).add(
                quoteWithdrawAvailable
              );
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

  public totalBaseBalance(): BN | null {
    return this.totalBalance(this.baseTokenDetails, this.tokenBaseBalances);
  }

  public totalQuoteBalance(): BN | null {
    return this.totalBalance(this.quoteTokenDetails, this.tokenQuoteBalances);
  }

  private totalBalance(
    details?: TokenDetails,
    balances?: Record<string, BN>
  ): BN | null {
    if (!details || !balances) {
      return null;
    }

    return Object.values(balances).reduce(
      (acc, balance) => acc.add(balance),
      ZERO
    );
  }

  public totalDeposits(): {
    baseTokenDeposits: BN;
    quoteTokenDeposits: BN;
  } {
    const [baseTokenDeposits, quoteTokenDeposits] = this.brackets.reduce<
      [BN, BN]
    >(
      ([totalBaseBalance, totalQuoteBalance], bracket) => {
        const [baseBalance, quoteBalance] = bracket.deposits.reduce<[BN, BN]>(
          ([baseBracketBalance, quoteBracketBalance], deposit) => {
            const bnAmount = new BN(deposit.amount);

            if (deposit.token === this.baseTokenAddress) {
              return [baseBracketBalance.add(bnAmount), quoteBracketBalance];
            } else {
              return [baseBracketBalance, quoteBracketBalance.add(bnAmount)];
            }
          },
          [ZERO, ZERO]
        );

        return [
          totalBaseBalance.add(baseBalance),
          totalQuoteBalance.add(quoteBalance),
        ];
      },
      [ZERO, ZERO]
    );

    return { baseTokenDeposits, quoteTokenDeposits };
  }
}

export default Strategy;
