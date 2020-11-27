import Decimal from "decimal.js";

import { useGetPrice } from "hooks/useGetPrice";
import { useTokenDetails } from "hooks/useTokenDetails";

import { ONE_HUNDRED_DECIMAL } from "utils/constants";

type UseIsStartPriceOutOfThresholdParams = {
  startPrice?: string;
  threshold: number;
  baseTokenAddress?: string;
  quoteTokenAddress?: string;
};

/**
 * Checks whether given `startPrice` is out of given `threshold` by comparing with market price.
 * Returns undefined on invalid input.
 * Returns 0 when `startPrice` is within threshold.
 * Returns +1 when `startPrice` is above threshold.
 * Returns -1 when `startPrice` is below threshold.
 */
export function useIsStartPriceOutOfThreshold(
  params: UseIsStartPriceOutOfThresholdParams
): number | undefined {
  const { baseTokenAddress, quoteTokenAddress, startPrice, threshold } = params;

  // Avoid additional queries if `startPrice` is not set
  const baseToken = useTokenDetails(startPrice ? baseTokenAddress : undefined);
  const quoteToken = useTokenDetails(
    startPrice ? quoteTokenAddress : undefined
  );

  const { price } = useGetPrice({ baseToken, quoteToken });

  if (!startPrice || isNaN(+startPrice) || !price) {
    return undefined;
  }

  const startPriceDecimal = new Decimal(startPrice);

  const priceDifferencePercentage = startPriceDecimal
    .minus(price)
    .div(price)
    .mul(ONE_HUNDRED_DECIMAL);

  const thresholdDecimal = new Decimal(threshold);

  // negative threshold --- zero ----- positive threshold
  // ########|----------------|----------------|#########
  //    -1   |                0                |   +1
  return priceDifferencePercentage.gt(thresholdDecimal)
    ? 1
    : !priceDifferencePercentage.gte(thresholdDecimal.negated())
    ? -1
    : 0;
}
