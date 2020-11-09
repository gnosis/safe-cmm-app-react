import React, { memo } from "react";
import Decimal from "decimal.js";

import { formatAmountFull } from "@gnosis.pm/dex-js";
import { Loader } from "@gnosis.pm/safe-react-components";

import { useAmountInUsd } from "hooks/useAmountInUsd";

import Strategy from "logic/strategy";

import { StrategyTotalValueViewer } from "./viewer";

export type Props = {
  strategy: Strategy;
};

export const StrategyTotalValue = memo(function StrategyTotalValue(
  props: Props
): JSX.Element {
  const { strategy } = props;
  const {
    baseTokenAddress,
    quoteTokenAddress,
    baseTokenDetails,
    quoteTokenDetails,
  } = strategy;

  const {
    amountInUsd: baseAmountInUsd,
    isLoading: isBaseAmountLoading,
  } = useAmountInUsd({
    tokenAddress: baseTokenAddress,
    amount: formatAmountFull({
      amount: strategy.totalBaseBalance(),
      precision: baseTokenDetails?.decimals || 18,
      thousandSeparator: false,
      isLocaleAware: false,
    }),
    source: "GnosisProtocol",
  });
  const {
    amountInUsd: quoteAmountInUsd,
    isLoading: isQuoteAmountLoading,
  } = useAmountInUsd({
    tokenAddress: quoteTokenAddress,
    amount: formatAmountFull({
      amount: strategy.totalQuoteBalance(),
      precision: quoteTokenDetails?.decimals || 18,
      thousandSeparator: false,
      isLocaleAware: false,
    }),
    source: "GnosisProtocol",
  });

  let totalValue: Decimal;
  if (baseAmountInUsd && quoteAmountInUsd) {
    totalValue = baseAmountInUsd.add(quoteAmountInUsd);
  } else if (baseAmountInUsd) {
    totalValue = baseAmountInUsd;
  } else {
    totalValue = quoteAmountInUsd;
  }

  // TODO: calculate hold value
  // TODO: calculate roi
  // TODO: calculate apy

  if (isBaseAmountLoading || isQuoteAmountLoading) {
    return <Loader size="md" />;
  }

  return <StrategyTotalValueViewer totalValue={totalValue} />;
});
