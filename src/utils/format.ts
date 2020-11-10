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

  // Store current Decimal defaults
  const [toExpNeg, toExpPos] = [Decimal.toExpNeg, Decimal.toExpPos];

  // Increase  range to avoid returning 1e+20 from Decimal.toString()
  // Which BN constructor doesn't like
  Decimal.set({ toExpNeg: -20, toExpPos: 40 });

  const amountBN = new BN(
    amountDecimal.mul(TEN_DECIMAL.pow(precision)).toString()
  );

  // Restore original Decimal config
  Decimal.set({ toExpNeg, toExpPos });

  return dexJsFormatSmart(amountBN, precision);
}
