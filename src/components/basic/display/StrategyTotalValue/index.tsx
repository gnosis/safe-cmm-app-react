import React, { memo } from "react";
import Decimal from "decimal.js";

import { formatAmountFull } from "@gnosis.pm/dex-js";
import { Loader } from "@gnosis.pm/safe-react-components";

import { useAmountInUsd } from "hooks/useAmountInUsd";

import Strategy from "logic/strategy";

import { StrategyTotalValueViewer } from "./viewer";

function addTotals(
  baseAmount: Decimal | null,
  quoteAmount: Decimal | null
): Decimal | undefined {
  if (baseAmount && quoteAmount) {
    return baseAmount.add(quoteAmount);
  } else if (baseAmount) {
    return baseAmount;
  } else if (quoteAmount) {
    return quoteAmount;
  } else {
    return undefined;
  }
}

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

  // Fetch Total value
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

  // Fetch Hodl value
  const { baseTokenDeposits, quoteTokenDeposits } = strategy.totalDeposits();

  const {
    amountInUsd: baseDepositAmountInUsd,
    isLoading: isBaseDepositAmountLoading,
  } = useAmountInUsd({
    tokenAddress: baseTokenAddress,
    amount: formatAmountFull({
      amount: baseTokenDeposits,
      precision: baseTokenDetails?.decimals || 18,
      thousandSeparator: false,
      isLocaleAware: false,
    }),
    source: "GnosisProtocol",
  });
  const {
    amountInUsd: quoteDepositAmountInUsd,
    isLoading: isQuoteDepositAmountLoading,
  } = useAmountInUsd({
    tokenAddress: quoteTokenAddress,
    amount: formatAmountFull({
      amount: quoteTokenDeposits,
      precision: quoteTokenDetails?.decimals || 18,
      thousandSeparator: false,
      isLocaleAware: false,
    }),
    source: "GnosisProtocol",
  });

  // TODO: calculate roi
  // TODO: calculate apy

  if (
    isBaseAmountLoading ||
    isQuoteAmountLoading ||
    isBaseDepositAmountLoading ||
    isQuoteDepositAmountLoading
  ) {
    return <Loader size="md" />;
  }

  const totalValue = addTotals(baseAmountInUsd, quoteAmountInUsd);

  const holdValue = addTotals(baseDepositAmountInUsd, quoteDepositAmountInUsd);

  return (
    <StrategyTotalValueViewer
      totalValue={totalValue}
      holdValue={holdValue}
    />
  );
});
