import Decimal from "decimal.js";
import { range } from "lodash";

import {
  ONE_DECIMAL,
  ONE_HUNDRED_DECIMAL,
  ZERO_DECIMAL,
} from "utils/constants";
import { safeStringToDecimal } from "utils/calculations";

export interface Params {
  lowestPrice: string;
  startPrice: string;
  highestPrice: string;
  totalBrackets: string;
}

interface Result {
  baseTokenBrackets: number;
  quoteTokenBrackets: number;
  bracketsSizes: number[];
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

  const lowestPrice = safeStringToDecimal(lowestPriceStr);
  const startPrice = safeStringToDecimal(startPriceStr);
  const highestPrice = safeStringToDecimal(highestPriceStr);
  const totalBrackets = Number(totalBracketsStr);
  // Minimal validation
  if (
    !lowestPrice ||
    !highestPrice ||
    isNaN(totalBrackets) ||
    lowestPrice.lte(ZERO_DECIMAL) ||
    lowestPrice.gte(highestPrice) ||
    totalBrackets <= 0
  ) {
    return {
      baseTokenBrackets: 0,
      quoteTokenBrackets: 0,
      bracketsSizes: [100],
    };
  }

  const stepSizeAsMultiplier = highestPrice
    .div(lowestPrice)
    .pow(ONE_DECIMAL.div(totalBrackets));

  const interval = highestPrice.minus(lowestPrice);

  // Calculates the percentage each bracket takes in the interval
  // Percentage given in the range 0-100
  const bracketsSizes = range(totalBrackets).map((index) => {
    const lowerBoundary = lowestPrice.mul(stepSizeAsMultiplier.pow(index));
    const upperBoundary = lowestPrice.mul(stepSizeAsMultiplier.pow(index + 1));

    const bracketLength = upperBoundary.minus(lowerBoundary);

    const percentageOfInterval = bracketLength
      .div(interval)
      .mul(ONE_HUNDRED_DECIMAL);

    return percentageOfInterval.toNumber();
  });

  // Same rounding as default Math.round
  Decimal.set({ rounding: Decimal.ROUND_HALF_CEIL });

  // Start price is optional.
  // Without it we don't know which brackets goes where,
  // but we can still give out the prices intervals
  if (!startPrice || startPrice.lte(ZERO_DECIMAL)) {
    return { baseTokenBrackets: 0, quoteTokenBrackets: 0, bracketsSizes };
  }

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
    bracketsSizes,
  };
}

export type FromMarketPriceParams = {
  marketPrice: Decimal;
  prices: Decimal[];
};

/**
 * Calculates brackets based on Market price
 *
 * Brackets below market price are set on the left
 * Bracket above market price are set on the right
 *
 * Middle bracket is assigned one of the sides according to the rule:
 *
 * bracket start               bracket middle                  bracket end
 * |----------------------------------|----------------------------------|
 *  \________________________________/|\________________________________/
 * When price falls in the left side, | When price falls in the right side,
 * bracket is counted on the left     | bracket is counted on the right
 */
export function calculateBracketsFromMarketPrice(
  params: FromMarketPriceParams
): Result {
  const { marketPrice, prices } = params;

  const result = {
    baseTokenBrackets: 0,
    quoteTokenBrackets: 0,
    bracketsSizes: [100],
  };

  if (
    // no invalid or empty market price
    marketPrice.isNaN() ||
    marketPrice.lte(ZERO_DECIMAL) ||
    // no empty prices array
    prices.length === 0 ||
    // no odd prices array
    prices.length % 2 !== 0 ||
    // no invalid first/last prices
    prices[0].isNaN() ||
    prices[prices.length - 1].isNaN() ||
    // no first price greater than or equal to last price
    prices[0].gte(prices[prices.length - 1]) ||
    // no first price less than or equal to zero
    prices[0].lte(ZERO_DECIMAL)
  ) {
    return result;
  }

  result.bracketsSizes = [];

  // there's 1 pair of prices per bracket
  const totalBrackets = prices.length / 2;

  const lowestPrice = prices[0];
  const highestPrice = prices[prices.length - 1];
  const interval = highestPrice.minus(lowestPrice);

  // Go over the prices in pairs
  range(0, prices.length, 2).forEach((index) => {
    const lowerBoundary = prices[index];
    const upperBoundary = prices[index + 1];

    const priceDifference = upperBoundary.minus(lowerBoundary);

    // Calculate the interval percentage
    const percentageOfInterval = priceDifference
      .div(interval)
      .mul(ONE_HUNDRED_DECIMAL);

    result.bracketsSizes.push(percentageOfInterval.toNumber());

    // Try to find where the market price fits
    if (marketPrice.gte(lowerBoundary) && marketPrice.lt(upperBoundary)) {
      // middle bracket found!
      result.baseTokenBrackets = index / 2;
      result.quoteTokenBrackets = totalBrackets - index / 2 - 1;
      // now, which side takes it?
      if (marketPrice.lt(lowerBoundary.add(priceDifference.div(2)))) {
        result.baseTokenBrackets += 1;
      } else {
        result.quoteTokenBrackets += 1;
      }
    }
  });

  // In case the market price was outside the prices range
  if (lowestPrice.gt(marketPrice)) {
    // all on the right
    result.quoteTokenBrackets = totalBrackets;
    return result;
  } else if (marketPrice.gt(highestPrice)) {
    // all on the left
    result.baseTokenBrackets = totalBrackets;
    return result;
  }
  return result;
}
