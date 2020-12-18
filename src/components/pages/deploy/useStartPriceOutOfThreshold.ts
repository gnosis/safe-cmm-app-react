import Decimal from "decimal.js";

import { useGetPrice } from "hooks/useGetPrice";
import { useTokenDetails } from "hooks/useTokenDetails";

import { safeStringToDecimal } from "utils/calculations";
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

  const startPriceDecimal = safeStringToDecimal(startPrice);

  // Avoid additional queries if `startPrice` is not set
  const baseToken = useTokenDetails(startPriceDecimal && baseTokenAddress);
  const quoteToken = useTokenDetails(startPriceDecimal && quoteTokenAddress);

  const { price } = useGetPrice({ baseToken, quoteToken });

  if (!startPriceDecimal || !price) {
    return undefined;
  }

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
