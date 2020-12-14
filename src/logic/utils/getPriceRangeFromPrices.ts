import Decimal from "decimal.js";

import { TokenDetails } from "types";

import { PriceRange } from "logic/IStrategy";

export const getPriceRangeFromPrices = (
  bracketPrices: Decimal[],
  quoteTokenDetails: TokenDetails
): PriceRange => {
  if (!bracketPrices.length) {
    return null;
  }

  const lower = bracketPrices[0];
  const upper = bracketPrices[bracketPrices.length - 1];

  return {
    lower,
    upper,
    token: quoteTokenDetails,
  };
};
