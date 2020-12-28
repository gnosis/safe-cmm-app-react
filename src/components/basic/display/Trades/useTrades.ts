import { useContext, useEffect, useRef, useState } from "react";
import { useRecoilCallback, useRecoilState } from "recoil";

import { StrategyState } from "types";

import {
  EventWithBlockInfo,
  fetchTradesAndReverts,
  FetchTradesAndRevertsResult,
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
    ): Promise<FetchTradesAndRevertsResult> => {
      // Get the state for this strategy
      const lastCheckedBlockState = lastCheckedBlockSelector(
        strategy.transactionHash
      );

      // Get latestCheckedBlock from global state
      let nextFromBlock =
        (await snapshot.getPromise(lastCheckedBlockState)) ||
        strategy.deploymentBlock;
      console.log(`fetchAll from block`, nextFromBlock);

      let latestBlockNumber = _latestBlockNumber;

      // When latestBlock not set means this is the first load
      // In that case, fetch the number from the network
      if (!latestBlockNumber) {
        const latestBlock = await context.web3Instance.eth.getBlock("latest");
        latestBlockNumber = latestBlock.number;
      }
      console.log(`latest block`, latestBlockNumber);

      let allTrades = [];
      let allReverts = [];

      // Fetches all trades and reverts in batches
      while (nextFromBlock < latestBlockNumber) {
        // Stop loop if component un-mounts
        if (cancelled.current) {
          console.log(`cancelled, stopping`);
          return { trades: allTrades, reverts: allReverts };
        }

        const toBlock = Math.min(
          nextFromBlock + TRADES_BATCH_SIZE,
          latestBlockNumber
        );

        const {
          trades: rangeTrades,
          reverts: rangeReverts,
        } = await fetchTradesAndReverts(
          strategy,
          context,
          nextFromBlock,
          toBlock
        );
        console.log(
          `fetched ${rangeTrades.length} trades and ${rangeReverts.length} reverts`
        );
        allTrades = allTrades.concat(rangeTrades);
        allReverts = allReverts.concat(rangeReverts);

        nextFromBlock = toBlock;
      }

      console.log(
        `done fetching all trades and reverts until block ${latestBlockNumber}`
      );

      set(lastCheckedBlockState, latestBlockNumber);

      return { trades: allTrades, reverts: allReverts };
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
        ({ trades, reverts }) => {
          console.log(
            `got response from fetchAll:`,
            trades.length,
            reverts.length
          );

          // Only try to persist state if not unmounted
          if (!cancelled.current) {
            console.log(`processed trades`);

            // Only update trades state if there was any new trade or revert
            (trades.length > 0 || reverts.length > 0) &&
              setTrades(
                (curr) =>
                  matchTradesAndReverts({
                    trades: (curr as EventWithBlockInfo[]).concat(trades),
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
