import Decimal from "decimal.js";
import { ZERO_DECIMAL } from "./constants";

import { dateDiffInDays } from "./time";

/**
 * Safely adds two decimals, accounting for the case where one or both are null
 *
 * @param a First decimal
 * @param b Second decimal
 */
export function safeAddDecimals(
  a: Decimal | null,
  b: Decimal | null
): Decimal | undefined {
  if (a && b) {
    return a.add(b);
  } else if (a) {
    return a;
  } else if (b) {
    return b;
  } else {
    return undefined;
  }
}

export function safeStringToDecimal(value?: string): Decimal | undefined {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || isNaN(+trimmedValue) || !isFinite(+trimmedValue)) {
    return undefined;
  }

  return new Decimal(trimmedValue);
}

/**
 * Calculates ROI based on difference between current|initial values.
 * Returns undefined when any input is invalid.
 *
 * @param currentValue Current strategy value
 * @param initialValue Initial Strategy value
 */
export function calculateRoi(
  currentValue: Decimal | undefined,
  initialValue: Decimal | undefined
): Decimal | undefined {
  if (!currentValue || !initialValue) {
    return undefined;
  }
  const difference = currentValue.minus(initialValue);
  return difference.div(initialValue);
}

/**
 * Calculates APR based on difference between current|initial values.
 * Uses start[|end]Date to annualize the value.
 * If no endDate is given, uses current date as endDate.
 * Returns undefined when any input is invalid.
 *
 * @param currentValue Current strategy value
 * @param initialValue Initial strategy value
 * @param startDate Date strategy was created
 * @param endDate Optional date strategy was stopped
 */
export function calculateApr(
  currentValue: Decimal | undefined,
  initialValue: Decimal | undefined,
  startDate: Date,
  endDate?: Date
): Decimal | undefined {
  const _endDate = endDate || new Date();

  if (!currentValue || !initialValue || startDate > _endDate) {
    return undefined;
  }

  const difference = currentValue.minus(initialValue);

  const days = dateDiffInDays(startDate, _endDate);

  if (days === 0) {
    return ZERO_DECIMAL;
  }

  const differencePerDay = difference.div(initialValue).div(days);

  return differencePerDay.mul("365");
}
