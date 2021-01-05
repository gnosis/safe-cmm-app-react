import React, { memo, useCallback } from "react";

import { useTokenDetails } from "hooks/useTokenDetails";
import { useGetPrice } from "hooks/useGetPrice";

import { MarketPriceViewer } from "./viewer";

export interface Props {
  baseTokenAddress?: string;
  quoteTokenAddress?: string;
  onPriceClick?: (price: string) => void;
}

export const MarketPrice = memo(
  (props: Props): JSX.Element => {
    const { baseTokenAddress, quoteTokenAddress, onPriceClick } = props;

    // TODO: handle error
    const baseToken = useTokenDetails(baseTokenAddress);
    const quoteToken = useTokenDetails(quoteTokenAddress);

    // TODO: propagate error up to parent when dealing with validation
    const { price, isLoading } = useGetPrice({
      baseToken: baseToken,
      quoteToken: quoteToken,
      source: "1inch",
    });

    const onClick = useCallback(() => {
      if (onPriceClick && price && !isLoading) {
        onPriceClick(price.toString());
      }
    }, [price, isLoading, onPriceClick]);

    return (
      <MarketPriceViewer
        baseTokenAddress={baseTokenAddress}
        quoteTokenAddress={quoteTokenAddress}
        isPriceLoading={isLoading}
        price={price ? price.toString() : ""}
        onClick={onClick}
      />
    );
  }
);
