import React, { memo, useEffect, useState } from "react";

import { transformTradeEventToDisplayTrade } from "api/web3/trades";

import { StrategyState } from "types";

import { TradesView } from "./TradesView";
import { useTrades } from "./useTrades";

export type Props = { strategy?: StrategyState };

export const Trades = memo(function Trades(props: Props): JSX.Element {
  const { strategy } = props;

  const [trades, setTrades] = useState([]);

  const { trades: eventTrades, isLoading } = useTrades(strategy);

  useEffect(() => {
    if (
      eventTrades.length === 0 ||
      !strategy.baseToken ||
      !strategy.quoteToken
    ) {
      setTrades([]);
    } else {
      setTrades(
        eventTrades
          .filter(({ revertId }) => !revertId)
          // transform into UI format
          .map((trade) =>
            transformTradeEventToDisplayTrade({
              trade,
              baseToken: strategy.baseToken,
              quoteToken: strategy.quoteToken,
            })
          )
      );
    }
  }, [eventTrades, strategy.baseToken, strategy.quoteToken]);

  return (
    <TradesView
      trades={trades}
      totalTrades={trades.length}
      isLoading={isLoading}
    />
  );
});
