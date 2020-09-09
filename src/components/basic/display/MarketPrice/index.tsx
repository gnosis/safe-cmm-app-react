import React, { useMemo, useEffect, memo } from "react";

import { useTokenDetails } from "hooks/useTokenDetails";
import { useGetPrice } from "hooks/useGetPrice";

import { build1InchPriceUrl } from "utils/priceUrls";

import { MarketPriceViewer } from "./viewer";

export interface Props {
  baseTokenAddress?: string;
  quoteTokenAddress?: string;
  setError?: (msg?: string) => void;
  // injected hooks
  useTokenDetailsHook?: typeof useTokenDetails;
  useGetPriceHook?: typeof useGetPrice;
}

function component(props: Props): JSX.Element {
  const {
    baseTokenAddress,
    quoteTokenAddress,
    setError,
    useTokenDetailsHook = useTokenDetails,
    useGetPriceHook = useGetPrice,
  } = props;

  const baseToken = useTokenDetailsHook(baseTokenAddress);
  const quoteToken = useTokenDetailsHook(quoteTokenAddress);

  // TODO: propagate error up to parent when dealing with validation
  const { price, isLoading, error } = useGetPriceHook({
    baseToken: baseToken,
    quoteToken: quoteToken,
    source: "1inch",
  });

  useEffect(() => {
    setError && setError(error);
  }, [error]);

  const priceUrl = useMemo(
    (): string => build1InchPriceUrl(baseToken, quoteToken),
    [baseToken, quoteToken]
  );

  return (
    <MarketPriceViewer
      baseTokenAddress={baseTokenAddress}
      quoteTokenAddress={quoteTokenAddress}
      isPriceLoading={isLoading}
      price={price ? price.toString() : ""}
      priceUrl={priceUrl}
    />
  );
}

export const MarketPrice = memo(component);
