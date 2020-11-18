import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import Decimal from "decimal.js";

import { StrategyState } from "types";

import { usdReferenceTokenState } from "state/selectors";

import { amountInQuote } from "api/prices";

import { useSafeInfo } from "hooks/useSafeInfo";

import { Network } from "utils/constants";
import {
  safeAddDecimals,
  calculateApr,
  calculateRoi,
} from "utils/calculations";
import { safeAsyncFn } from "utils/misc";

type Return = {
  totalValue: Decimal | undefined;
  holdValue: Decimal | undefined;
  roi: Decimal | undefined;
  apr: Decimal | undefined;
  isLoading: boolean;
};

export function useCalculateValues(params: {
  strategy: StrategyState;
}): Return {
  const { strategy } = params;
  const {
    baseToken,
    quoteToken,
    baseBalance,
    quoteBalance,
    baseFunding,
    quoteFunding,
    created,
    firstBatchId: batchId,
  } = strategy;

  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState<Decimal | undefined>(undefined);
  const [holdValue, setHoldValue] = useState<Decimal | undefined>(undefined);
  const [roi, setRoi] = useState<Decimal | undefined>(undefined);
  const [apr, setApr] = useState<Decimal | undefined>(undefined);

  const usdReferenceToken = useRecoilValue(usdReferenceTokenState);
  const { network } = useSafeInfo();
  const networkId = Network[network];

  useEffect(() => {
    async function fetchValues(): Promise<void> {
      if (!baseToken || !quoteToken) {
        return;
      }

      console.log(
        `input:`,
        baseBalance?.toFixed(),
        quoteBalance?.toFixed(),
        baseFunding?.toFixed(),
        quoteFunding?.toFixed()
      );

      setIsLoading(true);

      const [
        baseAmountInUsd,
        quoteAmountInUsd,
        baseDepositInUsd,
        quoteDepositInUsd,
        baseHistoricalInUsd,
        quoteHistoricalInUsd,
      ] = await Promise.all([
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken,
          quoteToken: usdReferenceToken,
          amount: baseBalance?.toFixed(),
          networkId,
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken: quoteToken,
          quoteToken: usdReferenceToken,
          amount: quoteBalance?.toFixed(),
          networkId,
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken,
          quoteToken: usdReferenceToken,
          amount: baseFunding?.toFixed(),
          networkId,
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken: quoteToken,
          quoteToken: usdReferenceToken,
          amount: quoteFunding?.toFixed(),
          networkId,
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken,
          quoteToken: usdReferenceToken,
          amount: baseFunding?.toFixed(),
          networkId,
          sourceOptions: { batchId },
          cacheTime: 0, // Cache historical prices forever, they won't change
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken: quoteToken,
          quoteToken: usdReferenceToken,
          amount: quoteFunding?.toFixed(),
          networkId,
          sourceOptions: { batchId },
          cacheTime: 0,
        }),
      ]);

      const totalValue = safeAddDecimals(baseAmountInUsd, quoteAmountInUsd);
      const holdValue = safeAddDecimals(baseDepositInUsd, quoteDepositInUsd);
      const roi = calculateRoi(totalValue, holdValue);
      const apr = calculateApr(
        totalValue,
        safeAddDecimals(baseHistoricalInUsd, quoteHistoricalInUsd),
        created
      );

      setTotalValue(totalValue);
      setHoldValue(holdValue);
      setRoi(roi);
      setApr(apr);

      setIsLoading(false);
    }

    fetchValues();
  }, [
    baseToken,
    baseBalance,
    baseFunding,
    batchId,
    created,
    networkId,
    quoteToken,
    quoteBalance,
    quoteFunding,
    usdReferenceToken,
  ]);

  return { totalValue, holdValue, roi, apr, isLoading };
}
