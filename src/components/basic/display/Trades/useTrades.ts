import { useContext, useEffect, useRef, useState } from "react";
import { useRecoilCallback, useRecoilState } from "recoil";

import { StrategyState } from "types";

import {
  EventWithBlockInfo,
  fetchTradeEventsForStrategy,
  matchTradesAndReverts,
  Trade,
} from "api/web3/trades";

import { lastCheckedBlockSelector, tradesSelector } from "state/atoms";

import { useNewBlockHeader } from "hooks/useNewBlockHeader";

import { TRADES_BATCH_SIZE } from "utils/constants";

import {
  ContractInteractionContext,
  ContractInteractionContextProps,
} from "components/context/ContractInteractionProvider";

type FetchAllResult = [EventWithBlockInfo[], EventWithBlockInfo[]];

async function fetchAllOnRange(
  strategy: StrategyState,
  context: ContractInteractionContextProps,
  fromBlock: number,
  toBlock?: number
): Promise<FetchAllResult> {
  return Promise.all([
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
}

export function useTrades(
  strategy: StrategyState
): { trades: Trade[]; isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(false);

  const [trades, setTrades] = useRecoilState(
    tradesSelector(strategy.transactionHash)
  );

  const context = useContext(ContractInteractionContext);

  // "instance" variable to control when component is unmounted and drop promises
  const cancelled = useRef(false);
  // "instance" variable to prevent concurrent queries
  const canQuery = useRef(true);

  const newBlock = useNewBlockHeader();

  const fetchAll = useRecoilCallback(
    ({ snapshot, set }) => async (
      strategy: StrategyState,
      context: ContractInteractionContextProps,
      _latestBlockNumber?: number
    ): Promise<FetchAllResult> => {
      const lastCheckedBlockState = lastCheckedBlockSelector(
        strategy.transactionHash
      );

      let nextFromBlock =
        (await snapshot.getPromise(lastCheckedBlockState)) ||
        strategy.deploymentBlock;
      console.log(`fetchAll from block`, nextFromBlock);

      let latestBlockNumber = _latestBlockNumber;

      if (!latestBlockNumber) {
        const latestBlock = await context.web3Instance.eth.getBlock("latest");
        latestBlockNumber = latestBlock.number;
      }
      console.log(`latest block`, latestBlockNumber);

      let trades = [];
      let reverts = [];

      // Fetches all trades and reverts in batches
      while (nextFromBlock < latestBlockNumber) {
        // Stop loop if component un-mounts
        if (cancelled.current) {
          console.log(`cancelled, stopping`);
          return [trades, reverts];
        }

        const toBlock = Math.min(
          nextFromBlock + TRADES_BATCH_SIZE,
          latestBlockNumber
        );

        const [rangeTrades, rangeReverts] = await fetchAllOnRange(
          strategy,
          context,
          nextFromBlock,
          toBlock
        );
        console.log(
          `fetched ${rangeTrades.length} trades and ${rangeReverts.length} reverts`
        );
        trades = trades.concat(rangeTrades);
        reverts = reverts.concat(rangeReverts);

        nextFromBlock = toBlock;
      }

      console.log(
        `done fetching all trades and reverts until block ${latestBlockNumber}`
      );

      set(lastCheckedBlockState, latestBlockNumber);

      return [trades, reverts];
    },
    []
  );

  useEffect(() => {
    cancelled.current = false;

    console.log(`starting to fetch trades`);
    if (
      strategy?.hasFetchedBalance &&
      context.web3Instance &&
      (!newBlock || newBlock.number % 5 === 0) &&
      canQuery.current
    ) {
      // Prevent concurrent requests
      canQuery.current = false;

      setIsLoading(true);
      // TODO: closed strategies don't need to look at the most recent blocks
      // Implement query to get blocknumber from timestamp: https://blocklytics.org/blog/ethereum-blocks-subgraph-made-for-time-travel/
      fetchAll(strategy, context, newBlock?.number).then(
        ([tradeEvents, reverts]) => {
          console.log(
            `got response from fetchAll:`,
            tradeEvents.length,
            reverts.length
          );

          // Only try to persist state if not unmounted
          if (!cancelled.current) {
            console.log(`processed trades`);

            // Only update trades state if there was any new trade or revert
            (tradeEvents.length > 0 || reverts.length > 0) &&
              setTrades(
                (curr) =>
                  matchTradesAndReverts({
                    trades: (curr as EventWithBlockInfo[]).concat(tradeEvents),
                    reverts,
                  }).sort((a, b) => b.timestamp - a.timestamp) // sort descending
              );

            setIsLoading(false);

            // Release lock
            canQuery.current = true;

            // Shouldn't check closed strategies again
            if (strategy.withdrawRequestDate) {
              canQuery.current = false;
              console.log(
                `closed strategy, no longer checking for new trades from here on`
              );
            }
          }
        }
      );
    }

    return (): void => {
      cancelled.current = true;
    };
  }, [context, fetchAll, newBlock, setTrades, strategy]);

  return { trades, isLoading: isLoading || !strategy?.hasFetchedBalance };
}
