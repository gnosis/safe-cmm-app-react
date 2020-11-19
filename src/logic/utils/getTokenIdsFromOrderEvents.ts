import { OrderPlacementEvent } from "logic/EventStrategy";

export const getTokenIdsFromOrderEvents = (
  bracketOrderEvents: OrderPlacementEvent[] = []
): [number, number] => {
  const firstBracketEvent = bracketOrderEvents[0];

  if (!firstBracketEvent) {
    return null;
  }

  const baseToken = firstBracketEvent.buyToken;
  const quoteToken = firstBracketEvent.sellToken;

  return [baseToken, quoteToken];
};
