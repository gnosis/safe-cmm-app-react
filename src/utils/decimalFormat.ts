import Decimal from "decimal.js";
import { TokenDetails } from "types";

const SMALLEST_DECIMAL = new Decimal(0.00001);

export const decimalFormat = (
  decimal: Decimal,
  token: TokenDetails
): string => {
  if (decimal.lt(SMALLEST_DECIMAL)) {
    return `<${SMALLEST_DECIMAL.toString()} ${token.symbol}`;
  }

  return decimal.toSD(4).toString();
};
