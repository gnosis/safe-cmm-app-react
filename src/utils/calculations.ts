import Decimal from "decimal.js";

import { dateDiffInDays } from "./time";

//TODO: unit tests

export function addTotals(
  baseAmount: Decimal | null,
  quoteAmount: Decimal | null
): Decimal | undefined {
  if (baseAmount && quoteAmount) {
    return baseAmount.add(quoteAmount);
  } else if (baseAmount) {
    return baseAmount;
  } else if (quoteAmount) {
    return quoteAmount;
  } else {
    return undefined;
  }
}

export function calculateRoi(
  current: Decimal | undefined,
  initial: Decimal | undefined
): Decimal | undefined {
  if (!current || !initial) {
    return undefined;
  }
  const difference = current.minus(initial);
  return difference.div(initial);
}

export function calculateApr(
  totalValue: Decimal | undefined,
  initialValue: Decimal | undefined,
  startDate: Date
): Decimal | undefined {
  if (!totalValue || !initialValue) {
    return undefined;
  }
  const difference = totalValue.minus(initialValue);

  const days = dateDiffInDays(startDate, new Date());
  const differencePerDay = difference.div(initialValue).div(days);

  return differencePerDay.mul("365");
}
