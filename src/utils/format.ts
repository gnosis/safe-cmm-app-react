import BN from "bn.js";
import Decimal from "decimal.js";

import { formatSmart as dexJsFormatSmart } from "@gnosis.pm/dex-js";
import { TEN_DECIMAL } from "./constants";

// TODO: consider moving to dex-js
/**
 * Formats given amount nicely.
 * Does not expose additional options as original dex-js' formatSmart yet
 *
 * @param amount Amount either Decimal or String
 */
export function formatSmart(amount: Decimal | string): string {
  let amountDecimal: Decimal;
  const precision = 20;

  if (typeof amount === "string") {
    amountDecimal = new Decimal(amount);
  } else {
    amountDecimal = amount;
  }

  const amountBN = new BN(
    amountDecimal.mul(TEN_DECIMAL.pow(precision)).toString()
  );

  return dexJsFormatSmart(amountBN, precision);
}
