import BN from "bn.js";
import Decimal from "decimal.js";

import { formatSmart as dexJsFormatSmart } from "@gnosis.pm/dex-js";

import { TEN_DECIMAL } from "utils/constants";

// TODO: consider moving to dex-js
/**
 * Formats given amount nicely.
 * If precision is given, does a down shit of `precision` decimals.
 * Does not expose additional options as original dex-js' formatSmart yet
 *
 * @param amount Amount either Decimal or String
 * @param precision Precision to down shift the amount. When not given,
 *  assumes values already at the correct precision.
 */
export function formatSmart(
  amount?: Decimal | string,
  precision = 0
): string | null {
  let amountDecimal: Decimal;

  if (amount === undefined) {
    return null;
  } else if (typeof amount === "string") {
    if (isNaN(+amount)) {
      return null;
    }

    amountDecimal = new Decimal(amount);
  } else {
    if (amount.isNaN()) {
      return null;
    }

    amountDecimal = amount;
  }

  // "Why expand precision?" You might ask
  // Because BNs can't handle decimals.
  // Passing anything with a decimal makes BN constructor go bananas.
  // Since we are reusing `formatSmart` from dex-js that deals only with BNs,
  // we need to convert it first.

  const decimalPlaces = amountDecimal.decimalPlaces();
  const amountExpandedAndAsString = amountDecimal
    .mul(TEN_DECIMAL.pow(decimalPlaces))
    .toDecimalPlaces(0)
    .toFixed();

  try {
    const amountBN = new BN(amountExpandedAndAsString);

    return dexJsFormatSmart(amountBN, decimalPlaces + precision);
  } catch (e) {
    const message = `Failed to nicely format '${amountDecimal.toFixed()}'. Was trying to create a BN with the string: '${amountExpandedAndAsString}'`;
    console.error(message, e);
    // Swallow potential BN error message which is too cryptic to understand what went wrong.
    // Very likely the issue is that the string used to create the BN with was invalid
    throw new Error(message);
  }
}

export function BNtoDecimal(
  amount?: BN,
  precision?: number
): undefined | Decimal {
  if (!amount || precision === undefined) {
    return null;
  }
  return new Decimal(amount.toString()).div(TEN_DECIMAL.pow(precision));
}
