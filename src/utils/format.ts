import BN from "bn.js";
import Decimal from "decimal.js";

import { formatSmart as dexJsFormatSmart } from "@gnosis.pm/dex-js";

import { TEN_DECIMAL } from "utils/constants";

const EXPAND_PRECISION_BY = 20;

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
export function formatSmart(amount: Decimal | string, precision = 0): string {
  let amountDecimal: Decimal;

  if (typeof amount === "string") {
    amountDecimal = new Decimal(amount);
  } else {
    amountDecimal = amount;
  }

  // "Why expand precision?" You might ask
  // Because BNs can't handle decimals.
  // Passing anything with a decimal makes BN constructor go bananas.
  // Since we are reusing `formatSmart` from dex-js that deals only with BNs,
  // we need to convert it first.

  console.log("amount to format", amountDecimal.toFixed());

  const amountBN = new BN(
    amountDecimal.mul(TEN_DECIMAL.pow(EXPAND_PRECISION_BY)).toFixed()
  );

  return dexJsFormatSmart(amountBN, EXPAND_PRECISION_BY + precision);
}
