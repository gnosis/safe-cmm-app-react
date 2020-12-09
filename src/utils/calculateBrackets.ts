import Decimal from "decimal.js";
import { range } from "lodash";

import {
  ONE_DECIMAL,
  ONE_HUNDRED_DECIMAL,
  ZERO_DECIMAL,
} from "utils/constants";

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
    startPriceNum <= 0 ||
    lowestPriceNum >= highestPriceNum ||
    totalBrackets <= 0
  ) {
    return { baseTokenBrackets: 0, quoteTokenBrackets: 0, bracketsSizes: [] };
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

  return {
    baseTokenBrackets: totalBrackets - quoteTokenBrackets,
    quoteTokenBrackets,
    bracketsSizes,
  };
}

export type FromMarketPriceParams = {
  lowestPrice: Decimal;
  highestPrice: Decimal;
  marketPrice: Decimal;
  totalBrackets: number;
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
  const {
    totalBrackets: inputTotalBrackets,
    marketPrice,
    lowestPrice,
    highestPrice,
  } = params;

  const result = {
    baseTokenBrackets: 0,
    quoteTokenBrackets: 0,
    bracketsSizes: [],
  };

  const totalBrackets = new Decimal(inputTotalBrackets);

  if (
    totalBrackets.isNaN() ||
    marketPrice.isNaN() ||
    lowestPrice.isNaN() ||
    highestPrice.isNaN() ||
    lowestPrice.gte(highestPrice) ||
    !lowestPrice.gt(ZERO_DECIMAL) ||
    !marketPrice.gt(ZERO_DECIMAL) ||
    !totalBrackets.gt(ZERO_DECIMAL)
  ) {
    return result;
  }

  if (lowestPrice.gt(marketPrice)) {
    // all on the right
    result.quoteTokenBrackets = totalBrackets.toNumber();
    return result;
  } else if (marketPrice.gt(highestPrice)) {
    // all on the left
    result.baseTokenBrackets = totalBrackets.toNumber();
    return result;
  } else {
    // market price somewhere in the middle

    // price position within the interval
    const pricePosition = marketPrice.minus(lowestPrice);
    const interval = highestPrice.minus(lowestPrice);
    const bracketSize = interval.div(totalBrackets);
    const middleBracket = pricePosition
      .div(bracketSize)
      // integer division
      .floor();

    // `increment` defines whether middleBracket is on left or right side
    // Calculates it by checking in which part of the bracket the price falls into
    // `price % bracketSize` gives us where within a bracket the price is located
    //  checking whether it's greater than `bracketSize/2` gives us which side
    const increment = pricePosition.mod(bracketSize).gt(bracketSize.div(2))
      ? ZERO_DECIMAL
      : ONE_DECIMAL;

    const quoteTokenBrackets = totalBrackets.minus(
      middleBracket.add(increment)
    );
    const baseTokenBrackets = totalBrackets.minus(quoteTokenBrackets);

    result.quoteTokenBrackets = quoteTokenBrackets.toNumber();
    result.baseTokenBrackets = baseTokenBrackets.toNumber();

    return result;
  }
}
