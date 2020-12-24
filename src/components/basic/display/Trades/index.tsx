import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  fetchTradeEventsForStrategy,
  transformTradeEventToDisplayTrade,
  matchTradesAndReverts,
} from "api/web3/trades";

import { StrategyState } from "types";

import {
  ContractInteractionContext,
  ContractInteractionContextProps,
} from "components/context/ContractInteractionProvider";

import { TradesView } from "./TradesView";

export type Props = { strategy?: StrategyState };

export const Trades = memo(function Trades(props: Props): JSX.Element {
  const { strategy } = props;

  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(ContractInteractionContext);

  // TODO: fetch in batches
  const fetchEvents = useCallback(
    async (
      strategy: StrategyState,
      context: ContractInteractionContextProps,
      fromBlock: number,
      toBlock?: number
    ) => {
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
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    if (strategy?.hasFetchedBalance) {
      setIsLoading(true);

      // TODO: closed strategies don't need to look at the most recent blocks
      // Implement query to get blocknumber from timestamp: https://blocklytics.org/blog/ethereum-blocks-subgraph-made-for-time-travel/
      fetchEvents(strategy, context, strategy.deploymentBlock).then(
        ([tradeEvents, reverts]) => {
          if (!cancelled) {
            const processedTrades = matchTradesAndReverts({
              trades: tradeEvents,
              reverts,
            });

            setTrades(
              processedTrades
                // remove reverted
                .filter(({ revertId }) => !revertId)
                // transform into UI format
                .map((trade) =>
                  transformTradeEventToDisplayTrade({
                    trade,
                    baseToken: strategy.baseToken,
                    quoteToken: strategy.quoteToken,
                  })
                )
                // sort descending
                .sort((a, b) => b.date.getTime() - a.date.getTime())
            );
          }
          setIsLoading(false);
        }
      );
    }

    return () => {
      cancelled = false;
    };
  }, [context, fetchEvents, strategy]);

  return (
    <TradesView
      trades={trades}
      totalTrades={trades.length}
      isLoading={isLoading}
    />
  );
});
