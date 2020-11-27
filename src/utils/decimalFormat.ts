import Decimal from "decimal.js";
import { TokenDetails } from "types";
import { ZERO_DECIMAL } from "./constants";

const SIGNIFICANT_DP = 4;
const SMALLEST_DECIMAL = new Decimal(10).toPower(-SIGNIFICANT_DP);

export const decimalTruncatedString = (
  decimal: Decimal,
  sd: number = SIGNIFICANT_DP
): string => {
  return new Decimal(decimal.toFixed(sd)).toString();
};

/**
 * Formats a decimal nicely. Use with ETH values, not WEI values.
 * Optionally append tokenDetail to format with token symbol.
 *
 * @param decimal
 * @param token
 */
export const decimalFormat = (
  decimal?: Decimal,
  token?: TokenDetails
): string => {
  // Prepended space on tokensymbol
  const tokenLabel = `${token ? " " + token.symbol : ""}`;
  if (!decimal) {
    return `0${tokenLabel}`;
  }
  if (decimal.abs().lt(SMALLEST_DECIMAL) && !decimal.abs().eq(ZERO_DECIMAL)) {
    return `${
      decimal.lt(0) ? ">-" : "<"
    }${SMALLEST_DECIMAL.toString()}${tokenLabel}`;
  }

  return `${decimalTruncatedString(decimal)}${tokenLabel}`;
};
