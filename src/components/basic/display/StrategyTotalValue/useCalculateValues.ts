import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import Decimal from "decimal.js";

import { formatAmountFull } from "@gnosis.pm/dex-js";

import Strategy from "logic/strategy";

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

export function useCalculateValues(params: { strategy: Strategy }): Return {
  const { strategy } = params;
  const {
    baseTokenDetails: baseToken,
    quoteTokenDetails: quoteToken,
    brackets,
    created,
  } = strategy;
  const batchId = brackets[0]?.deposits[0]?.batchId;

  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState<Decimal | undefined>(undefined);
  const [holdValue, setHoldValue] = useState<Decimal | undefined>(undefined);
  const [roi, setRoi] = useState<Decimal | undefined>(undefined);
  const [apr, setApr] = useState<Decimal | undefined>(undefined);

  const baseTotalBalance = formatAmountFull({
    amount: strategy.totalBaseBalance(),
    precision: baseToken?.decimals || 18,
    thousandSeparator: false,
    isLocaleAware: false,
  });
  const quoteTotalBalance = formatAmountFull({
    amount: strategy.totalQuoteBalance(),
    precision: quoteToken?.decimals || 18,
    thousandSeparator: false,
    isLocaleAware: false,
  });

  const { baseTokenDeposits, quoteTokenDeposits } = strategy.totalDeposits();

  const baseTotalDeposits = formatAmountFull({
    amount: baseTokenDeposits,
    precision: baseToken?.decimals || 18,
    thousandSeparator: false,
    isLocaleAware: false,
  });
  const quoteTotalDeposits = formatAmountFull({
    amount: quoteTokenDeposits,
    precision: quoteToken?.decimals || 18,
    thousandSeparator: false,
    isLocaleAware: false,
  });

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
      ] = await Promise.all([
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken,
          quoteToken: usdReferenceToken,
          amount: baseTotalBalance,
          networkId,
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken: quoteToken,
          quoteToken: usdReferenceToken,
          amount: quoteTotalBalance,
          networkId,
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken,
          quoteToken: usdReferenceToken,
          amount: baseTotalDeposits,
          networkId,
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken: quoteToken,
          quoteToken: usdReferenceToken,
          amount: quoteTotalDeposits,
          networkId,
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken,
          quoteToken: usdReferenceToken,
          amount: baseTotalDeposits,
          networkId,
          sourceOptions: { batchId },
          cacheTime: 0, // Cache historical prices forever, they won't change
        }),
        safeAsyncFn(amountInQuote, undefined, {
          source: "GnosisProtocol",
          baseToken: quoteToken,
          quoteToken: usdReferenceToken,
          amount: quoteTotalDeposits,
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
    baseTotalBalance,
    baseTotalDeposits,
    batchId,
    created,
    networkId,
    quoteToken,
    quoteTotalBalance,
    quoteTotalDeposits,
    usdReferenceToken,
  ]);

  return { totalValue, holdValue, roi, apr, isLoading };
}
