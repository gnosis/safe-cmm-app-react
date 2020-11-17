import Decimal from "decimal.js";

import { OrderPlacementEvent } from "logic/EventStrategy";
import { getTokenIdsFromOrderEvents } from "./getTokenIdsFromOrderEvents";

export const getBracketPricesFromOrderEvents = (
  bracketOrderEvents: OrderPlacementEvent[]
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
        new Decimal(bracketOrder.priceDenominator).div(
          new Decimal(bracketOrder.priceNumerator)
        )
      );
    }
    if (bracketOrder.buyToken === quoteToken) {
      bracketPrices.push(
        new Decimal(bracketOrder.priceNumerator).div(
          new Decimal(bracketOrder.priceDenominator)
        )
      );
    }
  });

  bracketPrices.sort((a: Decimal, b: Decimal): number => {
    if (a.eq(b)) return 0;
    return a.gt(b) ? 1 : -1;
  });

  return bracketPrices;
};
