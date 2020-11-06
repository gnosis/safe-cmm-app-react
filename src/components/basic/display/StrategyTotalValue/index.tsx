import React, { memo } from "react";
import Decimal from "decimal.js";
import { StrategyTotalValueViewer } from "./viewer";

export type Props = {
  baseAmount: Decimal;
  baseTokenAddress: string;
  quoteAmount: Decimal;
  quoteTokenAddress: string;
};

export const StrategyTotalValue = memo(function StrategyTotalValue(
  props: Props
): JSX.Element {
  const {
    baseAmount,
    baseTokenAddress,
    quoteAmount,
    quoteTokenAddress,
  } = props;

  // TODO: calculate total value
  // TODO: calculate hold value
  // TODO: calculate roi
  // TODO: calculate apy

  return <StrategyTotalValueViewer />;
});
