import Decimal from "decimal.js";

import { TokenDetails } from "types";

import { OrderPlacementEvent } from "logic/EventStrategy";

import { adjustPriceDecimals } from "utils/prices";

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
        adjustPriceDecimals({
          price: new Decimal(bracketOrder.priceDenominator).div(
            new Decimal(bracketOrder.priceNumerator)
          ),
          numeratorDecimals: quoteTokenDecimals,
          denominatorDecimals: baseTokenDecimals,
        })
      );
    }
    if (bracketOrder.buyToken === quoteToken) {
      bracketPrices.push(
        adjustPriceDecimals({
          price: new Decimal(bracketOrder.priceNumerator).div(
            new Decimal(bracketOrder.priceDenominator)
          ),
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
