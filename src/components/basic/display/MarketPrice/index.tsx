import React, { useMemo, useEffect } from "react";

import { useTokenDetails } from "hooks/useTokenDetails";
import { useGetPrice } from "hooks/useGetPrice";

import { build1InchPriceUrl } from "utils/priceUrls";

import { MarketPriceViewer } from "./viewer";

export interface Props {
  tokenAAddress?: string;
  tokenBAddress?: string;
  setError?: (msg?: string) => void;
}

export const MarketPrice = (props: Props): JSX.Element => {
  const { tokenAAddress, tokenBAddress, setError } = props;

  const tokenA = useTokenDetails(tokenAAddress);
  const tokenB = useTokenDetails(tokenBAddress);

  // TODO: propagate error up to parent when dealing with validation
  const { price, isLoading, error } = useGetPrice({
    baseToken: tokenA,
    quoteToken: tokenB,
    source: "1inch",
  });

  useEffect(() => {
    setError && setError(error);
  }, [error]);

  const priceUrl = useMemo((): string => build1InchPriceUrl(tokenA, tokenB), [
    tokenA,
    tokenB,
  ]);

  return (
    <MarketPriceViewer
      tokenA={tokenA}
      tokenB={tokenB}
      isPriceLoading={isLoading}
      price={price ? price.toString() : ""}
      priceUrl={priceUrl}
    />
  );
};
