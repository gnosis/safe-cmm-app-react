import { useEffect, useState } from "react";

import { StrategyState } from "types";

import { safeAddDecimals } from "utils/calculations";
import { formatSmart } from "utils/format";

import { useAmountInUsd } from "../../../../hooks/useAmountInUsd";

export type Result = {
  totalFunding: string;
  isLoading: boolean;
};

export function useTotalFunding(strategy: StrategyState): Result {
  const { baseToken, baseFunding, quoteToken, quoteFunding } = strategy;

  const [totalFunding, setTotalFunding] = useState("");

  const {
    amountInUsd: baseAmountInUsd,
    isLoading: isBaseAmountLoading,
  } = useAmountInUsd({
    tokenAddress: baseToken?.address,
    amount: baseFunding?.toFixed(),
    source: "GnosisProtocol",
  });
  const {
    amountInUsd: quoteAmountInUsd,
    isLoading: isQuoteAmountLoading,
  } = useAmountInUsd({
    tokenAddress: quoteToken?.address,
    amount: quoteFunding?.toFixed(),
    source: "GnosisProtocol",
  });

  const isLoading = isBaseAmountLoading || isQuoteAmountLoading;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    try {
      const amountString = formatSmart(
        safeAddDecimals(baseAmountInUsd, quoteAmountInUsd)
      );
      setTotalFunding(amountString ? `~$${amountString}` : "N/A");
    } catch (e) {
      console.error(`Failed to format total funding`, e);
      setTotalFunding("N/A");
    }
  }, [baseAmountInUsd, isLoading, quoteAmountInUsd]);

  return { totalFunding, isLoading };
}
