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
import { makeCancellablePromise, safeAsyncFn } from "utils/misc";
import { dateToBatchId } from "utils/time";

type Return = {
  totalValue: Decimal | undefined;
  holdValue: Decimal | undefined;
  withdrawnValue: Decimal | undefined;
  roi: Decimal | undefined;
  apr: Decimal | undefined;
  isLoading: boolean;
};

type Params = { strategy: StrategyState };

export function useCalculateValues(params: Params): Return {
  const { strategy } = params;
  const {
    baseToken,
    quoteToken,
    baseBalance,
    quoteBalance,
    baseFunding,
    quoteFunding,
    baseWithdrawn,
    quoteWithdrawn,
    created,
    claimDate,
    withdrawRequestDate,
    firstBatchId: batchId,
  } = strategy;

  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState<Decimal | undefined>(undefined);
  const [holdValue, setHoldValue] = useState<Decimal | undefined>(undefined);
  const [withdrawnValue, setWithdrawnValue] = useState<Decimal | undefined>(
    undefined
  );
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

      setIsLoading(true);

      const [
        baseAmountInUsd,
        quoteAmountInUsd,
        baseDepositInUsd,
        quoteDepositInUsd,
        baseHistoricalInUsd,
        quoteHistoricalInUsd,
        baseWithdrawnInUsd,
        quoteWithdrawnInUsd,
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
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken,
          quoteToken: usdReferenceToken,
          amount: baseWithdrawn?.toFixed(),
          networkId,
          sourceOptions: { batchId: dateToBatchId(claimDate) },
          cacheTime: 0,
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken: quoteToken,
          quoteToken: usdReferenceToken,
          amount: quoteWithdrawn?.toFixed(),
          networkId,
          sourceOptions: { batchId: dateToBatchId(claimDate) },
          cacheTime: 0,
        }),
      ]);

      const strategyValueNow = safeAddDecimals(
        baseAmountInUsd,
        quoteAmountInUsd
      );
      const fundingValueNow = safeAddDecimals(
        baseDepositInUsd,
        quoteDepositInUsd
      );
      const fundingValueOnStrategyCreation = safeAddDecimals(
        baseHistoricalInUsd,
        quoteHistoricalInUsd
      );
      const withdrawnValueOnStrategyClose = safeAddDecimals(
        baseWithdrawnInUsd,
        quoteWithdrawnInUsd
      );

      let currentValue = strategyValueNow;
      let initialValue = fundingValueNow;

      // When Strategy is CLOSED, the funds have been withdrawn/claimed
      // claimDate will be set.
      // Balances will be 0.
      // ROI and APR will be calculated based on historical prices.

      if (claimDate) {
        currentValue = withdrawnValueOnStrategyClose;
        initialValue = fundingValueOnStrategyCreation;
      }

      const roi = calculateRoi(currentValue, initialValue);
      const apr = calculateApr(
        currentValue,
        fundingValueOnStrategyCreation, // always against funding value on creation
        created,
        claimDate || withdrawRequestDate
      );

      setTotalValue(strategyValueNow);
      setHoldValue(fundingValueNow);
      setWithdrawnValue(withdrawnValueOnStrategyClose);
      setRoi(roi);
      setApr(apr);

      setIsLoading(false);
    }

    const { cancel } = makeCancellablePromise(fetchValues());

    return (): void => cancel();
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
    claimDate,
    withdrawRequestDate,
    baseWithdrawn,
    quoteWithdrawn,
  ]);

  return { totalValue, holdValue, withdrawnValue, roi, apr, isLoading };
}
