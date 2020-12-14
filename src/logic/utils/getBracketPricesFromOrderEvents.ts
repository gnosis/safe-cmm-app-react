import Decimal from "decimal.js";

import { TokenDetails } from "types";

import { OrderPlacementEvent } from "logic/EventStrategy";

import { calculatePrice } from "utils/prices";

import { getTokenIdsFromOrderEvents } from "./getTokenIdsFromOrderEvents";

export const getBracketPricesFromOrderEvents = (
  bracketOrderEvents: OrderPlacementEvent[],
  { decimals: baseTokenDecimals }: TokenDetails,
  { decimals: quoteTokenDecimals }: TokenDetails
): Decimal[] => {
  const tokenIdsOrNull = getTokenIdsFromOrderEvents(bracketOrderEvents);

  if (!tokenIdsOrNull) {
    return null;
  }

  const [baseToken, quoteToken] = tokenIdsOrNull;

  const bracketPrices = [];
  bracketOrderEvents.forEach((bracketOrder) => {
    if (bracketOrder.buyToken === baseToken) {
      bracketPrices.push(
        calculatePrice({
          numerator: bracketOrder.priceDenominator,
          denominator: bracketOrder.priceNumerator,
          numeratorDecimals: quoteTokenDecimals,
          denominatorDecimals: baseTokenDecimals,
        })
      );
    }
    if (bracketOrder.buyToken === quoteToken) {
      bracketPrices.push(
        calculatePrice({
          numerator: bracketOrder.priceNumerator,
          denominator: bracketOrder.priceDenominator,
          numeratorDecimals: quoteTokenDecimals,
          denominatorDecimals: baseTokenDecimals,
        })
      );
    }
  });

  bracketPrices.sort((a: Decimal, b: Decimal): number => {
    if (a.eq(b)) return 0;
    return a.gt(b) ? 1 : -1;
  });

  return bracketPrices;
};
