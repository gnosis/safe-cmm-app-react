import Decimal from "decimal.js";

import { TEN_DECIMAL, ZERO_DECIMAL } from "./constants";

type AdjustPriceDecimalParams = {
  price: Decimal;
  denominatorDecimals: number;
  numeratorDecimals: number;
};

/**
 * Adjusts price decimals
 */
export function adjustPriceDecimals({
  price,
  denominatorDecimals,
  numeratorDecimals,
}: AdjustPriceDecimalParams): Decimal {
  return price.mul(TEN_DECIMAL.pow(denominatorDecimals - numeratorDecimals));
}

type CalculatePriceParams = {
  numerator: string;
  denominator: string;
  numeratorDecimals: number;
  denominatorDecimals: number;
};

/**
 * Calculates price, given numerator/denominator strings and respective decimals
 */
export function calculatePrice({
  numerator,
  denominator,
  numeratorDecimals,
  denominatorDecimals,
}: CalculatePriceParams): Decimal {
  try {
    const price = new Decimal(numerator).div(new Decimal(denominator));

    return adjustPriceDecimals({
      price,
      numeratorDecimals,
      denominatorDecimals,
    });
  } catch (e) {
    console.error(
      `Failed to calculate price for numerator:${numerator} and denominator:${denominator}`,
      e
    );
    return ZERO_DECIMAL;
  }
}
