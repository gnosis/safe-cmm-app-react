import React, { memo } from "react";

import { useGetPrice } from "hooks/useGetPrice";
import { useTokenDetails } from "hooks/useTokenDetails";

import { calculateBrackets } from "utils/calculateBrackets";

import { BracketsViewView, Props as ViewerProps } from "./viewer";

export type Props = ViewerProps;

export const BracketsViewer = memo(function BracketsViewer(
  props: Props
): JSX.Element {
  const {
    baseTokenAddress,
    quoteTokenAddress,
    type,
    startPrice,
    lowestPrice,
    highestPrice,
    totalBrackets,
    leftBrackets,
    rightBrackets,
  } = props;

  const isStrategy = type === "strategy";

  // Fetch market price, only if on Strategy page
  const { tokenDetails: baseToken } = useTokenDetails(
    isStrategy ? baseTokenAddress : undefined
  );
  const { tokenDetails: quoteToken } = useTokenDetails(
    isStrategy ? quoteTokenAddress : undefined
  );
  const { price } = useGetPrice({ baseToken, quoteToken });
  const marketPrice = price?.isFinite() ? price.toString() : "N/A";

  // Calculate brackets, only if on Strategy page (marketPrice)
  const { baseTokenBrackets, quoteTokenBrackets } = calculateBrackets({
    startPrice: marketPrice,
    totalBrackets: totalBrackets?.toString() || "",
    lowestPrice,
    highestPrice,
  });

  return (
    <BracketsViewView
      {...props}
      startPrice={isStrategy ? marketPrice : startPrice}
      leftBrackets={isStrategy ? baseTokenBrackets : leftBrackets}
      rightBrackets={isStrategy ? quoteTokenBrackets : rightBrackets}
    />
  );
});
