import Decimal from "decimal.js";
import BN from "bn.js";
import { SetterOrUpdater } from "recoil";

import { getWithdrawableAmount } from "@gnosis.pm/dex-contracts";
import { ZERO } from "@gnosis.pm/dex-js";

import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";

import { BaseStrategy, Bracket, IStrategy } from "./IStrategy";
import { DepositEvent, FleetDeployEvent } from "./types";

import getLogger from "utils/logger";

import makeArtifactLoader from "utils/makeFakeArtifacts";

import { StrategyState } from "../types";
import { getTokenIdsFromOrderEvents } from "./utils/getTokenIdsFromOrderEvents";
import { getBracketPricesFromOrderEvents } from "./utils/getBracketPricesFromOrderEvents";
import { getFundingPerBracket } from "./utils/getFundingPerBracket";
import { getTokenDetailsById } from "./utils/getTokenDetailsById";
import { getPriceRangeFromPrices } from "./utils/getPriceRangeFromPrices";
import { BNtoDecimal as BNToDecimal } from "utils/format";

const logger = getLogger("event strategy");

export interface OrderPlacementEvent {
  bracket: string;
  owner: string;
  index: number;
  buyToken: number;
  sellToken: number;
  validFrom: number;
  validUntil: number;
  priceNumerator: string;
  priceDenominator: string;
}

export interface WithdrawRequestEvent {
  amount: string;
  batchId: number;
  created: Date;
}

export interface WithdrawClaimEvent {
  batchId: number;
}

export class EventStrategy extends BaseStrategy implements IStrategy {
  private fleetDeployEvent: FleetDeployEvent;
  private setState: SetterOrUpdater<Partial<StrategyState>>;

  constructor(
    fleetDeployEvent: FleetDeployEvent,
    stateModifier: SetterOrUpdater<Partial<StrategyState>>
  ) {
    super();
    this.setState = stateModifier;

    this.setState({
      transactionHash: fleetDeployEvent.transactionHash,
      // Unknown because we don't know yet if this strategy is active, closed or if trading has stopped
      status: "UNKNOWN",
    });

    this.brackets = fleetDeployEvent.returnValues.fleet.map((address) => ({
      address,
    }));

    this.fleetDeployEvent = fleetDeployEvent;
    this.transactionHash = fleetDeployEvent.transactionHash;
    this.startBlockNumber = fleetDeployEvent.blockNumber;
  }

  private depositEvents: DepositEvent[] = null;
  private bracketOrderEvents: OrderPlacementEvent[] = null;
  private orderBatchIds: number[] = null;
  private block: any;

  async readFunding(context: ContractInteractionContextProps): Promise<void> {
    // Find creation date by block number
    this.block = await context.web3Instance.eth.getBlock(this.startBlockNumber);
    this.created = new Date(this.block.timestamp * 1000);

    this.setState({ created: this.created });

    const batchExchangeContract = await context.getDeployed("BatchExchange");

    let depositLoadPromise = Promise.resolve(this.depositEvents);
    let bracketOrderPromise = Promise.resolve(this.bracketOrderEvents);

    // Load tokens used, by looking through bracket events
    if (this.depositEvents === null || this.bracketOrderEvents === null) {
      this.orderBatchIds = [];
      depositLoadPromise = Promise.all(
        this.brackets.map(
          async (bracket: Bracket): Promise<DepositEvent[]> => {
            const deposits =
              (await batchExchangeContract.getPastEvents("Deposit", {
                fromBlock: this.startBlockNumber - 1,
                filter: { user: bracket.address },
              })) || [];

            deposits.forEach((deposit) => {
              if (!this.orderBatchIds.includes(deposit.returnValues.batchId)) {
                this.orderBatchIds.push(deposit.returnValues.batchId);
              }
            });

            return deposits.map(
              (event: Record<string, any>): DepositEvent => ({
                token: event.returnValues.token,
                amount: event.returnValues.amount,
                batchId: event.returnValues.batchId,
                bracketAddress: event.returnValues.user,
              })
            );
          }
        )
      )
        // Deposits will be a 2D array, for each bracket all deposits (should only be one) -> flatten
        .then((deposits) => deposits.flat())
        .then((deposits) => {
          this.depositEvents = deposits;
          return deposits;
        });

      bracketOrderPromise = Promise.all(
        this.brackets.map(
          async (bracket: Bracket): Promise<OrderPlacementEvent[]> => {
            const orders =
              (await batchExchangeContract.getPastEvents("OrderPlacement", {
                fromBlock: this.startBlockNumber - 1,
                filter: { owner: bracket.address },
              })) || [];

            return orders.map((event: Record<string, any>) => ({
              bracket: bracket.address,
              owner: event.returnValues.owner,
              index: event.returnValues.index,
              buyToken: event.returnValues.buyToken,
              sellToken: event.returnValues.sellToken,
              validFrom: event.returnValues.validFrom,
              validUntil: event.returnValues.validUntil,
              priceNumerator: event.returnValues.priceNumerator,
              priceDenominator: event.returnValues.priceDenominator,
            }));
          }
        )
      )
        // Orders will be a 2D array, for each bracket all orders -> flatten
        .then((orders) => orders.flat())
        .then((orders) => {
          this.bracketOrderEvents = orders;
          return orders;
        });
    }

    // This pattern is used in multiple places in this class, it is to batch promises that can run concurrently
    // together with one Promise.all, so they can run side-by-side, if they don't have dependencies on each other.
    // The promise variables default to resolve promises with the cached values. If the cached values aren't found or invalid
    // the async actions will run again and be stored in the promise variables, so they can be awaited together, either returning
    // the cached value, or the newly calculated one. (Although here the values of the promises don't matter)
    await Promise.all([depositLoadPromise, bracketOrderPromise]);

    // Find token Ids in order events
    // Pitfall: this function takes the first order event to determine what is base and what is quote. Might be wrong.
    const tokenIdsOrNull = getTokenIdsFromOrderEvents(this.bracketOrderEvents);

    if (!tokenIdsOrNull) {
      this.setState({ status: "INCOMPLETE" });
      return;
    }

    const [baseTokenId, quoteTokenId] = tokenIdsOrNull;

    this.baseTokenId = baseTokenId;
    this.quoteTokenId = quoteTokenId;

    // Find prices in order events
    // Pitfall: not possible to directly assign these to bracket addresses, we have to guess in what order the
    //          proxy safes were used. Best not to rely on this information too much, it could be wrong.
    const bracketPrices = getBracketPricesFromOrderEvents(
      this.bracketOrderEvents
    );

    this.prices = bracketPrices;

    // Resolve token details by id
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

    // Bracket fundings from deposit events
    const bracketFunding = getFundingPerBracket(
      this.depositEvents,
      this.brackets,
      this.baseTokenDetails.address,
      this.quoteTokenDetails.address
    );

    // Update brackets to include funding of both base and quote (rarely applicable that it contains both)
    this.brackets = this.brackets.map(
      (bracket: Bracket): Bracket => {
        if (!bracketFunding[bracket.address]) {
          // No funding event found for the bracket, could be because of incomplete or invalid transaction
          return {
            ...bracket,
            fundingBase: new Decimal(0),
            fundingQuote: new Decimal(0),
          };
        }

        const [fundingBase, fundingQuote] = bracketFunding[bracket.address];

        return {
          ...bracket,
          fundingBase: new Decimal(fundingBase.toString()).div(
            Math.pow(10, this.baseTokenDetails.decimals)
          ),
          fundingQuote: new Decimal(fundingQuote.toString()).div(
            Math.pow(10, this.quoteTokenDetails.decimals)
          ),
        };
      }
    );

    // Calculate total funding of base and quote tokens
    const baseFundingWei = Object.keys(bracketFunding).reduce(
      (acc: BN, bracketAddress: string): BN =>
        acc.iadd(bracketFunding[bracketAddress]?.[0] || new BN(0)),
      new BN(0)
    );
    this.baseFunding = new Decimal(baseFundingWei.toString()).div(
      Math.pow(10, this.baseTokenDetails.decimals)
    );
    const quoteFundingWei = Object.keys(bracketFunding).reduce(
      (acc: BN, bracketAddress: string): BN =>
        acc.iadd(bracketFunding[bracketAddress]?.[1] || new BN(0)),
      new BN(0)
    );
    this.quoteFunding = new Decimal(quoteFundingWei.toString()).div(
      Math.pow(10, this.quoteTokenDetails.decimals)
    );

    const priceRange = getPriceRangeFromPrices(
      bracketPrices,
      this.baseTokenDetails,
      this.quoteTokenDetails
    );

    // Update state
    this.setState({
      brackets: this.brackets,
      baseFunding: this.baseFunding,
      quoteFunding: this.quoteFunding,
      baseToken: this.baseTokenDetails,
      quoteToken: this.quoteTokenDetails,
      priceRange,
      prices: bracketPrices,
      hasFetchedFunding: true,
      firstBatchId: this.depositEvents[0]?.batchId,
    });
  }

  private withdrawRequestEvents: WithdrawRequestEvent[];
  private withdrawClaimEvents: WithdrawClaimEvent[];

  async readStatus(context: ContractInteractionContextProps): Promise<void> {
    const batchExchangeContract = await context.getDeployed("BatchExchange");

    //await this.readFunding(context);
    const bracketAddresses = this.brackets.map(({ address }) => address);

    if (!this.depositEvents.length) {
      this.setState({
        status: "INCOMPLETE",
      });
      return;
    }

    let status;
    if (!this.withdrawRequestEvents) {
      const withdrawRequests = await batchExchangeContract.getPastEvents(
        "WithdrawRequest",
        {
          fromBlock: this.startBlockNumber - 1,
          filter: {
            batchId: this.depositEvents[0].batchId,
            user: bracketAddresses,
          },
        }
      );

      // Find timestamp for the withdraw request
      // Pitfall: This assumes all withdrawRequests were created at the same time!!
      if (withdrawRequests.length > 0) {
        const tradeStopBlock = await context.web3Instance.eth.getBlock(
          withdrawRequests[0].blockNumber
        );
        const tradeStopTimestamp = new Date(tradeStopBlock.timestamp * 1000);
        this.setState({
          withdrawRequestDate: tradeStopTimestamp,
        });

        status = "TRADING_STOPPED";
        // Only then could it also have claims
        const withdrawClaims = await batchExchangeContract.getPastEvents(
          "Withdraw",
          {
            fromBlock: this.startBlockNumber - 1,
            filter: {
              token: [
                this.baseTokenDetails.address,
                this.quoteTokenDetails.address,
              ],
              user: bracketAddresses,
            },
          }
        );

        if (withdrawClaims.length > 0) {
          status = "CLOSED";

          const baseClaimed = new BN(0);
          const quoteClaimed = new BN(0);
          withdrawClaims.forEach(
            (claim: { returnValues: { token: string; amount: string } }) => {
              console.log(`claim`, claim);
              if (claim.returnValues.token === this.baseTokenDetails?.address) {
                baseClaimed.iadd(new BN(claim.returnValues.amount));
              } else {
                quoteClaimed.iadd(new BN(claim.returnValues.amount));
              }
            }
          );
          const baseWithdrawn = BNToDecimal(
            baseClaimed,
            this.baseTokenDetails?.decimals
          );
          const quoteWithdrawn = BNToDecimal(
            quoteClaimed,
            this.quoteTokenDetails?.decimals
          );

          const claimBlock = await context.web3Instance.eth.getBlock(
            withdrawClaims[0].blockNumber
          );
          const claimDate = new Date(claimBlock.timestamp * 1000);

          this.setState({ status, claimDate, baseWithdrawn, quoteWithdrawn });
          return;
        }
      } else {
        status = "ACTIVE";
      }
    }
    console.log(this);

    this.setState({ status, hasFetchedStatus: true });
  }

  async readBalances(context: ContractInteractionContextProps): Promise<void> {
    if (!this.quoteTokenDetails || !this.baseTokenDetails) {
      return;
    }
    const quoteTokenAddress = this.quoteTokenDetails.address;
    const baseTokenAddress = this.baseTokenDetails.address;

    const batchExchangeContract = await context.getDeployed("BatchExchange");

    const artifacts = makeArtifactLoader(context);
    const batchExchangeTC = artifacts.require("BatchExchange");
    const batchExchangeDeployedWithTruffle = await batchExchangeTC.deployed();

    const baseBalances: Record<string, BN> = {};
    const quoteBalances: Record<string, BN> = {};
    await Promise.all(
      this.brackets.map(
        async (bracket: Bracket): Promise<void> => {
          const [quoteBalance, quoteWithdrawAvailable] = await Promise.all([
            // In BatchExchange
            batchExchangeContract.methods
              .getBalance(bracket.address, quoteTokenAddress)
              .call(),
            // Available for Withdraw
            getWithdrawableAmount(
              bracket.address,
              quoteTokenAddress,
              batchExchangeDeployedWithTruffle,
              context.web3Instance
            ),
          ]);
          const [baseBalance, baseWithdrawAvailable] = await Promise.all([
            // In BatchExchange
            batchExchangeContract.methods
              .getBalance(bracket.address, baseTokenAddress)
              .call(),
            // Available for Withdraw
            getWithdrawableAmount(
              bracket.address,
              baseTokenAddress,
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

    this.tokenBaseBalances = baseBalances;
    this.tokenQuoteBalances = quoteBalances;

    this.brackets = this.brackets.map((bracket: Bracket) => ({
      ...bracket,
      balanceBase: new Decimal(
        this.tokenBaseBalances[bracket.address].toString()
      ).div(Math.pow(10, this.baseTokenDetails.decimals)),
      balanceQuote: new Decimal(
        this.tokenQuoteBalances[bracket.address].toString()
      ).div(Math.pow(10, this.quoteTokenDetails.decimals)),
    }));

    // TODO: create utils fn for BN->Decimal conversions
    // TODO: create utils/private method for reducing balances
    const baseBalance = new Decimal(
      Object.values(baseBalances)
        .reduce((acc, balance) => acc.add(balance), ZERO)
        .toString()
    ).div(Math.pow(10, this.baseTokenDetails.decimals));
    const quoteBalance = new Decimal(
      Object.values(quoteBalances)
        .reduce((acc, balance) => acc.add(balance), ZERO)
        .toString()
    ).div(Math.pow(10, this.quoteTokenDetails.decimals));

    this.setState({
      brackets: this.brackets,
      baseBalance,
      quoteBalance,
      hasFetchedBalance: true,
    });
  }
}
