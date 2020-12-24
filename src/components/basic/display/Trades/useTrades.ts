import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { StrategyState } from "types";

import {
  EventWithBlockInfo,
  fetchTradeEventsForStrategy,
  matchTradesAndReverts,
  Trade,
} from "api/web3/trades";
import {
  ContractInteractionContext,
  ContractInteractionContextProps,
} from "components/context/ContractInteractionProvider";
import { useNewBlockHeader } from "hooks/useNewBlockHeader";

type blockValues = number | "latest" | null;

type FetchAllResult = [EventWithBlockInfo[], EventWithBlockInfo[]];

async function fetchAllOnRange(
  strategy: StrategyState,
  context: ContractInteractionContextProps,
  fromBlock: blockValues,
  toBlock?: blockValues
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
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fromBlock, setFromBlock] = useState(strategy.deploymentBlock);

  const context = useContext(ContractInteractionContext);

  const cancelled = useRef(false);

  const newBlock = useNewBlockHeader();

  const fetchAll = useCallback(
    async (
      strategy: StrategyState,
      context: ContractInteractionContextProps,
      fromBlock: number,
      _latestBlockNumber?: number
    ): Promise<FetchAllResult> => {
      console.log(`fetchAll from block`, fromBlock);

      let nextFromBlock = fromBlock;

      let latestBlockNumber = _latestBlockNumber;

      // todo:if might not be needed
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

        const toBlock = Math.min(nextFromBlock + 10000, latestBlockNumber);

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
        `done fetching all trades and reverts from block ${fromBlock} to block ${latestBlockNumber}`
      );

      setFromBlock(latestBlockNumber);

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
      (!newBlock || newBlock.number % 5 === 0)
    ) {
      setIsLoading(true);
      // TODO: closed strategies don't need to look at the most recent blocks
      // Implement query to get blocknumber from timestamp: https://blocklytics.org/blog/ethereum-blocks-subgraph-made-for-time-travel/
      fetchAll(strategy, context, fromBlock, newBlock?.number).then(
        ([tradeEvents, reverts]) => {
          console.log(
            `got response from fetchAll:`,
            tradeEvents.length,
            reverts.length
          );
          if (!cancelled.current) {
            console.log(`processed trades`);

            (tradeEvents.length > 0 || reverts.length > 0) &&
              setTrades(
                (curr) =>
                  matchTradesAndReverts({
                    trades: (curr as EventWithBlockInfo[]).concat(tradeEvents),
                    reverts,
                  }).sort((a, b) => b.timestamp) // sort descending
              );
            setIsLoading(false);
          }
        }
      );
    }

    return (): void => {
      cancelled.current = true;
    };
  }, [context, fetchAll, fromBlock, newBlock, strategy]);

  return { trades, isLoading };
}
