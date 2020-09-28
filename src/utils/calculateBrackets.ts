import Decimal from "decimal.js";

import { ONE_DECIMAL } from "utils/constants";

export interface Params {
  lowestPrice: string;
  startPrice: string;
  highestPrice: string;
  totalBrackets: string;
}

interface Result {
  baseTokenBrackets: number;
  quoteTokenBrackets: number;
}

/**
 * Calculates how many brackets will be used to fund base and quote amounts
 * All inputs are strings, to be converted internally
 * Minimal validation, returning both 0 when failed
 *
 * Based on https://github.com/gnosis/dex-liquidity-provision/blob/525138d8eab5e85536b98a621e6f9abf537fcca/scripts/utils/trading_strategy_helpers.js#L722-L751
 */
export function calculateBrackets(params: Params): Result {
  const {
    lowestPrice: lowestPriceStr,
    startPrice: startPriceStr,
    highestPrice: highestPriceStr,
    totalBrackets: totalBracketsStr,
  } = params;

  const lowestPriceNum = Number(lowestPriceStr);
  const startPriceNum = Number(startPriceStr);
  const highestPriceNum = Number(highestPriceStr);
  const totalBrackets = Number(totalBracketsStr);
  // Minimal validation
  if (
    isNaN(lowestPriceNum) ||
    isNaN(startPriceNum) ||
    isNaN(highestPriceNum) ||
    isNaN(totalBrackets) ||
    lowestPriceNum <= 0 ||
    lowestPriceNum > startPriceNum ||
    startPriceNum > highestPriceNum ||
    totalBrackets <= 0
  ) {
    return { baseTokenBrackets: 0, quoteTokenBrackets: 0 };
  }

  //  Working with Decimals for enhanced precision
  const lowestPrice = new Decimal(lowestPriceStr);
  const startPrice = new Decimal(startPriceStr);
  const highestPrice = new Decimal(highestPriceStr);

  const stepSizeAsMultiplier = highestPrice
    .div(lowestPrice)
    .pow(ONE_DECIMAL.div(totalBrackets));

  // Same rounding as default Math.round
  Decimal.set({ rounding: Decimal.ROUND_HALF_CEIL });

  let quoteTokenBrackets = startPrice
    .div(lowestPrice)
    .ln()
    .div(stepSizeAsMultiplier.ln())
    // round to nearest integer
    .round()
    // will work with integers from now on
    .toNumber();

  if (quoteTokenBrackets > totalBrackets) {
    quoteTokenBrackets = totalBrackets;
  } else if (quoteTokenBrackets < 0) {
    quoteTokenBrackets = 0;
  }

  return {
    baseTokenBrackets: totalBrackets - quoteTokenBrackets,
    quoteTokenBrackets,
  };
}
