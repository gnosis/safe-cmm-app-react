import Decimal from "decimal.js";
import { PriceRange } from "logic/IStrategy";
import { TokenDetails } from "types";

export const getPriceRangeFromPrices = (
  bracketPrices: Decimal[],
  baseTokenDetails: TokenDetails,
  quoteTokenDetails: TokenDetails
): PriceRange => {
  if (!bracketPrices.length) {
    return null;
  }

  const firstPrice = bracketPrices[0];
  const lastPrice = bracketPrices[bracketPrices.length - 1];

  const decimalPlaces = Math.pow(
    10,
    quoteTokenDetails.decimals - baseTokenDetails.decimals
  );

  const lower = firstPrice.div(new Decimal(decimalPlaces));
  const upper = lastPrice.div(new Decimal(decimalPlaces));

  return {
    lower,
    upper,
    token: quoteTokenDetails,
  };
};
