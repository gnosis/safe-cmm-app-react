import Decimal from "decimal.js";
import clone from "lodash/clone";

import {
  calculateBracketsFromMarketPrice,
  FromMarketPriceParams,
} from "utils/calculateBrackets";

const baseParams: FromMarketPriceParams = {
  marketPrice: new Decimal("0.9"),
  lowestPrice: new Decimal("0.8"),
  highestPrice: new Decimal("1.2"),
  totalBrackets: 3,
};

describe("marketPrice out of range", () => {
  test("brackets to the left", () => {
    const params = clone(baseParams);
    const response = {
      baseTokenBrackets: params.totalBrackets,
      quoteTokenBrackets: 0,
    };
    params.marketPrice = new Decimal("1.21");
    expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
  });

  test("brackets to the right", () => {
    const params = clone(baseParams);
    const response = {
      baseTokenBrackets: 0,
      quoteTokenBrackets: params.totalBrackets,
    };
    params.marketPrice = new Decimal("0.79");
    expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
  });
});

describe("marketPrice within the range", () => {
  describe("single bracket", () => {
    test("all on the left", () => {
      const params = clone(baseParams);
      params.totalBrackets = 1;
      params.marketPrice = new Decimal("0.99");

      const response = {
        baseTokenBrackets: params.totalBrackets,
        quoteTokenBrackets: 0,
      };
      expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
    });
    test("all on the right", () => {
      const params = clone(baseParams);
      params.totalBrackets = 1;
      params.marketPrice = new Decimal("1.01");

      const response = {
        baseTokenBrackets: 0,
        quoteTokenBrackets: params.totalBrackets,
      };
      expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
    });
  });

  describe("2 brackets", () => {
    describe("marketPrice on bracket 2", () => {
      test("1 bracket each side", () => {
        const params = clone(baseParams);
        params.totalBrackets = 2;
        params.marketPrice = new Decimal("1.11");

        const response = {
          baseTokenBrackets: 1,
          quoteTokenBrackets: 1,
        };
        expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
      });
      test("both on the left", () => {
        const params = clone(baseParams);
        params.totalBrackets = 2;
        params.marketPrice = new Decimal("1.09");

        const response = {
          baseTokenBrackets: 2,
          quoteTokenBrackets: 0,
        };
        expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
      });
    });

    describe("marketPrice on bracket 1", () => {
      test("1 bracket each side", () => {
        const params = clone(baseParams);
        params.totalBrackets = 2;
        params.marketPrice = new Decimal("0.89");

        const response = {
          baseTokenBrackets: 1,
          quoteTokenBrackets: 1,
        };
        expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
      });
      test("both on the right", () => {
        const params = clone(baseParams);
        params.totalBrackets = 2;
        params.marketPrice = new Decimal("0.91");

        const response = {
          baseTokenBrackets: 0,
          quoteTokenBrackets: 2,
        };
        expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
      });
    });
  });
});

describe("invalid params", () => {
  const invalidResponse = {
    baseTokenBrackets: 0,
    quoteTokenBrackets: 0,
  };

  test("invalid totalBrackets", () => {
    const params = clone(baseParams);
    params.totalBrackets = 0;
    expect(calculateBracketsFromMarketPrice(params)).toEqual(invalidResponse);
  });

  test("invalid lowestPrice", () => {
    const params = clone(baseParams);
    params.lowestPrice = new Decimal(0);
    expect(calculateBracketsFromMarketPrice(params)).toEqual(invalidResponse);
  });

  test("invalid highestPrice", () => {
    const params = clone(baseParams);
    params.highestPrice = params.lowestPrice;
    expect(calculateBracketsFromMarketPrice(params)).toEqual(invalidResponse);
  });

  test("invalid marketPrice", () => {
    const params = clone(baseParams);
    params.marketPrice = new Decimal(0);
    expect(calculateBracketsFromMarketPrice(params)).toEqual(invalidResponse);
  });
});
