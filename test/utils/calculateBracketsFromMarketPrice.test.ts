import Decimal from "decimal.js";
import clone from "lodash/clone";

import {
  calculateBracketsFromMarketPrice,
  FromMarketPriceParams,
} from "utils/calculateBrackets";
import { ONE_DECIMAL, ZERO_DECIMAL } from "utils/constants";

const baseParams: FromMarketPriceParams = {
  marketPrice: new Decimal("0.9"),
  prices: [
    new Decimal("0.8"),
    new Decimal("0.89"),
    new Decimal("0.89"),
    new Decimal("0.99"),
    new Decimal("0.99"),
    new Decimal("1.2"),
  ],
};

const bracketsSizes = [22.5, 25, 52.5];

describe("marketPrice out of range", () => {
  test("brackets to the left", () => {
    const params = clone(baseParams);
    const response = {
      baseTokenBrackets: params.prices.length / 2,
      quoteTokenBrackets: 0,
      bracketsSizes,
    };
    params.marketPrice = new Decimal("1.21");
    expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
  });

  test("brackets to the right", () => {
    const params = clone(baseParams);
    const response = {
      baseTokenBrackets: 0,
      quoteTokenBrackets: params.prices.length / 2,
      bracketsSizes,
    };
    params.marketPrice = new Decimal("0.79");
    expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
  });
});

describe("marketPrice within the range", () => {
  describe("single bracket", () => {
    const prices = [
      baseParams.prices[0],
      baseParams.prices[baseParams.prices.length - 1],
    ];

    test("all on the left", () => {
      const params = {
        marketPrice: new Decimal("0.99"),
        prices,
      };

      const response = {
        baseTokenBrackets: params.prices.length / 2,
        quoteTokenBrackets: 0,
        bracketsSizes: [100],
      };
      expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
    });
    test("all on the right", () => {
      const params = {
        marketPrice: new Decimal("1.01"),
        prices,
      };

      const response = {
        baseTokenBrackets: 0,
        quoteTokenBrackets: params.prices.length / 2,
        bracketsSizes: [100],
      };
      expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
    });
  });

  describe("2 brackets", () => {
    const prices = [
      new Decimal("0.8"),
      new Decimal("0.95"),
      new Decimal("0.95"),
      new Decimal("1.2"),
    ];
    const bracketsSizes = [37.5, 62.5];

    describe("marketPrice on bracket 2", () => {
      test("1 bracket each side", () => {
        const params = {
          marketPrice: new Decimal("1.11"),
          prices,
        };

        const response = {
          baseTokenBrackets: 1,
          quoteTokenBrackets: 1,
          bracketsSizes,
        };
        expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
      });
      test("both on the left", () => {
        const params = {
          marketPrice: new Decimal("1"),
          prices,
        };

        const response = {
          baseTokenBrackets: 2,
          quoteTokenBrackets: 0,
          bracketsSizes,
        };
        expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
      });
    });

    describe("marketPrice on bracket 1", () => {
      test("1 bracket each side", () => {
        const params = {
          marketPrice: new Decimal("0.85"),
          prices,
        };

        const response = {
          baseTokenBrackets: 1,
          quoteTokenBrackets: 1,
          bracketsSizes,
        };
        expect(calculateBracketsFromMarketPrice(params)).toEqual(response);
      });
      test("both on the right", () => {
        const params = {
          marketPrice: new Decimal("0.9"),
          prices,
        };

        const response = {
          baseTokenBrackets: 0,
          quoteTokenBrackets: 2,
          bracketsSizes,
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
    bracketsSizes: [],
  };

  test("invalid prices", () => {
    const params = clone(baseParams);

    params.prices = [];
    expect(calculateBracketsFromMarketPrice(params)).toEqual(invalidResponse);

    params.prices = [ONE_DECIMAL];
    expect(calculateBracketsFromMarketPrice(params)).toEqual(invalidResponse);
  });

  test("invalid lowestPrice", () => {
    const params = clone(baseParams);
    params.prices[0] = ZERO_DECIMAL;
    expect(calculateBracketsFromMarketPrice(params)).toEqual(invalidResponse);
  });

  test("invalid highestPrice", () => {
    const params = clone(baseParams);
    params.prices[params.prices.length - 1] = params.prices[0];
    expect(calculateBracketsFromMarketPrice(params)).toEqual(invalidResponse);
  });

  test("invalid marketPrice", () => {
    const params = clone(baseParams);
    params.marketPrice = new Decimal(0);
    expect(calculateBracketsFromMarketPrice(params)).toEqual(invalidResponse);
  });
});
