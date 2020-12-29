import BN from "bn.js";
import Decimal from "decimal.js";

import { BatchExchangeEvents } from "@gnosis.pm/dex-js";

import { StrategyState, TokenDetails } from "types";

import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";

import { BNtoDecimal } from "utils/format";
import { ZERO_DECIMAL } from "utils/constants";
import { batchIdToDate, dateToBatchId } from "utils/time";
import getLoggerOrCreate from "utils/logger";

const logger = getLoggerOrCreate("trades api");

/* TYPES */

/**
 * BaseTradeEvent uses only info available on the emitted Trade/TradeReversion event
 */
export type BaseTradeEvent = {
  // order related
  orderId: string;
  sellTokenId: number;
  buyTokenId: number;
  sellAmount: string;
  buyAmount: string;
  // block related
  txHash: string;
  eventIndex: number;
  blockNumber: number;
  id: string; // eventIndex|address|txHash
  // bracket related
  bracketAddress: string;
};

/**
 * Base event with added details fetched from block
 */
export type EventWithBlockInfo = BaseTradeEvent & {
  timestamp: number;
  batchId: number;
};

/**
 * Trade object after matching it to reverts
 */
export type Trade = EventWithBlockInfo & {
  revertTimestamp?: number;
  revertId?: string;
  settlingTimestamp: number;
};

/**
 * Trade format used to display it in the UI
 */
export type DisplayTrade = {
  type: "buy" | "sell";
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
  baseTokenAmount: Decimal;
  quoteTokenAmount: Decimal;
  price: Decimal;
  date: Date;
  pendingUntil: Date;
};

type TradeEvent = BatchExchangeEvents["Trade"];

type FetchEventsParams = {
  context: ContractInteractionContextProps;
  brackets: { address: string }[];
  type: "Trade" | "TradeReversion";
  fromBlock?: number | string;
  toBlock?: number | string;
};

/**
 * Fetches Trade|TradeReversion events
 */
async function fetchEvents(
  params: FetchEventsParams
): Promise<BaseTradeEvent[]> {
  const {
    context,
    brackets,
    type,
    fromBlock = null,
    toBlock = "latest",
  } = params;
  const batchExchangeContract = await context.getDeployed("BatchExchange");

  logger.log(`Fetching ${type}s from block ${fromBlock} to block ${toBlock}`);

  return Promise.all(
    brackets.map(
      async ({ address }): Promise<BaseTradeEvent[]> => {
        try {
          const events = await batchExchangeContract.getPastEvents(type, {
            filter: { owner: address },
            fromBlock,
            toBlock,
          });
          return events.map(
            (event: TradeEvent): BaseTradeEvent => parseTradeEvent(event)
          );
        } catch (e) {
          logger.error(
            `Failed to fetch events for bracket ${address} from block ${fromBlock} to block ${toBlock}`,
            e
          );
          return [];
        }
      }
    )
  ).then((trades) => trades.flat());
}

/**
 * Transforms blockchain TradeEvent into BaseTradeEvent
 *
 * Blockchain event data for reference:
 * address: "0xC576eA7bd102F7E476368a5E98FA455d1Ea34dE2"
 * blockHash: "0xa153624247e478977474bccac23448f42254e216d2da8098f15a3bb691512dab"
 * blockNumber: 7760731
 * event: "Trade"
 * id: "log_c68fbee8"
 * logIndex: 20
 * raw: {data: "0x000000000000000000000000000000000000000000000000…00000000000000000000000000000000017dc486e8da73090", topics: Array(4)}
 * removed: false
 * returnValues: Result {0: "0xe22bC6bAB9E4F9525554315F13f7F416104A068c", 1: "1", 2: "2", 3: "32", 4: "85714272", 5: "1719328797408833680", owner: "0xe22bC6bAB9E4F9525554315F13f7F416104A068c", orderId: "1", sellToken: "2", buyToken: "32", executedSellAmount: "85714272", …}
 * signature: "0xafa5bc1fb80950b7cb2353ba0cf16a6d68de75801f2dac54b2dae9268450010a"
 * transactionHash: "0xd366a3ceebb96bd078575ce7c3f6c3b4851b91add07ac4d5645f137b6d0e9a17"
 * transactionIndex: 13
 */
function parseTradeEvent(event: TradeEvent): BaseTradeEvent {
  const {
    returnValues: {
      owner,
      orderId,
      sellToken,
      buyToken,
      executedSellAmount,
      executedBuyAmount,
    },
    transactionHash: txHash,
    logIndex: eventIndex,
    blockNumber,
  } = event;

  const trade: BaseTradeEvent = {
    bracketAddress: owner,
    orderId,
    sellTokenId: +sellToken,
    buyTokenId: +buyToken,
    sellAmount: executedSellAmount,
    buyAmount: executedBuyAmount,
    txHash,
    eventIndex,
    blockNumber,
    id: `${eventIndex}|${owner}|${txHash}`,
  };

  return trade;
}

// Cached block timestamps
// They might repeat across different brackets/strategies.
// No point querying it multiple times
const BLOCK_TIMESTAMP_CACHE: Record<number, number> = {};

/**
 * Fetches block timestamp from the cache or blockchain
 */
async function fetchBlockTimestamp(params: {
  context: ContractInteractionContextProps;
  blockNumber: number;
}): Promise<number> {
  const {
    context: { web3Instance },
    blockNumber,
  } = params;

  if (!BLOCK_TIMESTAMP_CACHE[blockNumber]) {
    try {
      if (web3Instance) {
        const block = await web3Instance.eth.getBlock(blockNumber);
        BLOCK_TIMESTAMP_CACHE[blockNumber] = +block.timestamp * 1000;
      } else {
        return 0;
      }
    } catch (e) {
      logger.error(`Failed to fetch block data for block ${blockNumber}`, e);
      return 0;
    }
  }
  return BLOCK_TIMESTAMP_CACHE[blockNumber];
}

export type FetchTradesForStrategyParams = Pick<
  FetchEventsParams,
  "context" | "fromBlock" | "toBlock" | "type"
> & {
  strategy: StrategyState;
};

/**
 * Fetches Trade|TradeReversion events for a given strategy
 */
export async function fetchTradeEventsForStrategy(
  params: FetchTradesForStrategyParams
): Promise<EventWithBlockInfo[]> {
  const { strategy, context, ...rest } = params;

  const trades = await fetchEvents({
    brackets: strategy.brackets,
    context,
    ...rest,
  });

  // Get unique map of blocks to avoid fetching the same block multiple times
  const blocks = trades.reduce(
    (acc, { blockNumber }) => acc.set(blockNumber, 0),
    new Map<number, number>()
  );

  // Fetch timestamp for each block
  await Promise.all(
    Array.from(blocks.keys()).map(
      async (blockNumber): Promise<void> => {
        blocks.set(
          blockNumber,
          await fetchBlockTimestamp({ blockNumber, context })
        );
      }
    )
  );

  // Add timestamp to trades
  return trades.map<EventWithBlockInfo>((trade) => ({
    ...trade,
    timestamp: blocks.get(trade.blockNumber) as number,
    batchId: dateToBatchId(blocks.get(trade.blockNumber) as number),
  }));
}

export type FetchTradesAndRevertsResult = {
  trades: EventWithBlockInfo[];
  reverts: EventWithBlockInfo[];
};

export async function fetchTradesAndReverts(
  strategy: StrategyState,
  context: ContractInteractionContextProps,
  fromBlock: number,
  toBlock?: number
): Promise<FetchTradesAndRevertsResult> {
  const [trades, reverts] = await Promise.all([
    fetchTradeEventsForStrategy({
      strategy,
      context,
      type: "Trade",
      fromBlock,
      toBlock,
    }),
    fetchTradeEventsForStrategy({
      strategy,
      context,
      type: "TradeReversion",
      fromBlock,
      toBlock,
    }),
  ]);

  return { trades, reverts };
}

/**
 * Builds a key used to find trades duplicates and reverts
 *
 * We assume there should be at most 1 trade per batchId, bracket and orderId
 */
function buildKey(event: EventWithBlockInfo): string {
  return `${event.batchId}|${event.bracketAddress}|${event.orderId}`;
}

/**
 * Given trades and reverts, match the reverts against trades based on a key.
 *
 * Returns Trade objects with revert information filled in.
 * Beware that reverted trades are not filtered!
 */
export function matchTradesAndReverts(params: {
  trades: EventWithBlockInfo[];
  reverts: EventWithBlockInfo[];
}): Trade[] {
  const { trades, reverts } = params;
  const tradesMap = new Map<string, Trade[]>();

  // Creates the mappings
  trades.forEach((trade) => {
    // Group trades by key
    // Each key groups trades with the same batchId, address and order id
    const key = buildKey(trade);

    const tradesList = tradesMap.get(key) || [];

    tradesList.push({
      ...trade,
      settlingTimestamp: batchIdToDate(trade.batchId).getTime(),
    });

    tradesMap.set(key, tradesList);
  });

  // Sort each list by blocknumber, eventIndex, ascending
  tradesMap.forEach((list) =>
    list.sort((a, b) => {
      if (a.blockNumber === b.blockNumber) {
        return a.eventIndex - b.eventIndex;
      }
      return a.blockNumber - b.blockNumber;
    })
  );

  // Apply reverts to trades mappings
  reverts.forEach((revert) => {
    const key = buildKey(revert);
    const tradesList = tradesMap.get(key) || [];

    for (const trade of tradesList) {
      if (!trade.revertId) {
        trade.revertId = revert.id;
        trade.revertTimestamp = revert.timestamp;
        // revert "consumed" here
        return;
      } else if (trade.revertId === revert.id) {
        // revert "consumed" before
        return;
      }
      // continue looking for a trade to revert
    }
  });

  // Flattening lists
  return Array.from(tradesMap.values()).reduce(
    (acc, tradesByKey) => acc.concat(tradesByKey),
    []
  );
}

type TransformTradeEventParams = {
  trade: Trade;
  baseToken: TokenDetails;
  quoteToken: TokenDetails;
};

/**
 * Transform between Trade format to DisplayTrade format
 */
export function transformTradeEventToDisplayTrade(
  params: TransformTradeEventParams
): DisplayTrade {
  const { trade, baseToken, quoteToken } = params;
  const {
    sellTokenId,
    buyAmount,
    sellAmount,
    timestamp,
    settlingTimestamp,
  } = trade;

  let type: "sell" | "buy";
  let baseTokenAmount: Decimal;
  let quoteTokenAmount: Decimal;

  const sellAmountBN = new BN(sellAmount);
  const buyAmountBN = new BN(buyAmount);

  if (sellTokenId === baseToken.id) {
    type = "sell";
    baseTokenAmount = BNtoDecimal(sellAmountBN, baseToken.decimals);
    quoteTokenAmount = BNtoDecimal(buyAmountBN, quoteToken.decimals);
  } else {
    type = "buy";
    baseTokenAmount = BNtoDecimal(buyAmountBN, quoteToken.decimals);
    quoteTokenAmount = BNtoDecimal(sellAmountBN, baseToken.decimals);
  }

  return {
    type,
    baseTokenSymbol: baseToken.symbol,
    quoteTokenSymbol: quoteToken.symbol,
    baseTokenAmount,
    quoteTokenAmount,
    price:
      baseTokenAmount && quoteTokenAmount
        ? quoteTokenAmount.div(baseTokenAmount)
        : ZERO_DECIMAL,
    date: new Date(timestamp),
    pendingUntil: new Date(settlingTimestamp),
  };
}
