import Decimal from "decimal.js";
import { TEN_DECIMAL } from "./constants";

type AdjustPriceDecimalParams = {
  price: Decimal;
  denominatorDecimals: number;
  numeratorDecimals: number;
};

/**
 * Adjusts price decimals
 *
 * @param price The price to fix
 * @param denominatorDecimals Denominator decimals
 * @param numeratorDecimals Numerator decimals
 */
export function adjustPriceDecimals({
  price,
  denominatorDecimals,
  numeratorDecimals,
}: AdjustPriceDecimalParams): Decimal {
  return price.mul(TEN_DECIMAL.pow(denominatorDecimals - numeratorDecimals));
}
