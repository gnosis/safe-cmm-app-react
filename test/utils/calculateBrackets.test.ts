import { Params, calculateBrackets } from "utils/calculateBrackets";
import clone from "lodash/clone";

function sumArray(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0);
}

const baseParams: Params = {
  lowestPrice: "0.8",
  startPrice: "1",
  highestPrice: "1.2",
  totalBrackets: "3",
};

test("totalBrackets == 0", () => {
  const params = clone(baseParams);
  params.totalBrackets = "0";

  expect(calculateBrackets(params)).toEqual({
    baseTokenBrackets: 0,
    quoteTokenBrackets: 0,
    bracketsSizes: [],
  });
});

test("totalBrackets == 1", () => {
  const params = clone(baseParams);
  params.totalBrackets = "1";

  expect(calculateBrackets(params)).toEqual({
    baseTokenBrackets: 0,
    quoteTokenBrackets: 1,
    bracketsSizes: [100],
  });
});

test("even brackets", () => {
  const params = clone(baseParams);
  params.totalBrackets = "2";

  const actual = calculateBrackets(params);

  expect(sumArray(actual.bracketsSizes)).toEqual(100);
  expect(actual.bracketsSizes.length).toEqual(+params.totalBrackets);
  expect(actual.bracketsSizes).toEqual([44.94897427831781, 55.05102572168219]);
  expect(actual.baseTokenBrackets).toEqual(1);
  expect(actual.quoteTokenBrackets).toEqual(1);
});

test("odd brackets", () => {
  const params = clone(baseParams);

  const actual = calculateBrackets(params);

  expect(sumArray(actual.bracketsSizes)).toEqual(100);
  expect(actual.bracketsSizes.length).toEqual(+params.totalBrackets);
  expect(actual.baseTokenBrackets).toEqual(1);
  expect(actual.quoteTokenBrackets).toEqual(2);
});

test("lowestPrice > startPrice", () => {
  const params = clone(baseParams);
  params.startPrice = (Number(params.lowestPrice) * 0.9).toString();

  const actual = calculateBrackets(params);

  expect(sumArray(actual.bracketsSizes)).toEqual(100);
  expect(actual.bracketsSizes.length).toEqual(+params.totalBrackets);
  expect(actual.baseTokenBrackets).toEqual(3);
  expect(actual.quoteTokenBrackets).toEqual(0);
});

test("lowestPrice == startPrice", () => {
  const params = clone(baseParams);
  params.startPrice = params.lowestPrice;

  const actual = calculateBrackets(params);

  expect(sumArray(actual.bracketsSizes)).toEqual(100);
  expect(actual.bracketsSizes.length).toEqual(+params.totalBrackets);
  expect(actual.baseTokenBrackets).toEqual(3);
  expect(actual.quoteTokenBrackets).toEqual(0);
});

test("startPrice == highestPrice", () => {
  const params = clone(baseParams);
  params.startPrice = params.highestPrice;

  const actual = calculateBrackets(params);

  expect(sumArray(actual.bracketsSizes)).toEqual(100);
  expect(actual.bracketsSizes.length).toEqual(+params.totalBrackets);
  expect(actual.baseTokenBrackets).toEqual(0);
  expect(actual.quoteTokenBrackets).toEqual(3);
});

test("startPrice > highestPrice", () => {
  const params = clone(baseParams);
  params.startPrice = (Number(params.highestPrice) * 1.1).toString();

  const actual = calculateBrackets(params);

  expect(sumArray(actual.bracketsSizes)).toEqual(100);
  expect(actual.bracketsSizes.length).toEqual(+params.totalBrackets);
  expect(actual.baseTokenBrackets).toEqual(0);
  expect(actual.quoteTokenBrackets).toEqual(3);
});

test("startPrice == bracket boundary", () => {
  const params = clone(baseParams);
  // value manually calculated:
  // pow(highestPrice/lowestPrice, 1/totalBrackets) * lowestPrice
  // pow(1.2/0.8, 1/3) * 0.8
  params.startPrice = "0.915771394";

  const actual = calculateBrackets(params);

  expect(sumArray(actual.bracketsSizes)).toEqual(100);
  expect(actual.bracketsSizes.length).toEqual(+params.totalBrackets);
  expect(actual.baseTokenBrackets).toEqual(2);
  expect(actual.quoteTokenBrackets).toEqual(1);
});

describe("invalid params", () => {
  const invalidResponse = {
    baseTokenBrackets: 0,
    quoteTokenBrackets: 0,
    bracketsSizes: [],
  };
  test("invalid lowestPrice", () => {
    const params = clone(baseParams);
    params.lowestPrice = "";
    expect(calculateBrackets(params)).toEqual(invalidResponse);
  });

  test("invalid startPrice", () => {
    const params = clone(baseParams);
    params.startPrice = "sfas";
    expect(calculateBrackets(params)).toEqual(invalidResponse);
  });

  test("invalid highestPrice", () => {
    const params = clone(baseParams);
    params.highestPrice = "234de";
    expect(calculateBrackets(params)).toEqual(invalidResponse);
  });

  test("invalid totalBrackets", () => {
    const params = clone(baseParams);
    params.totalBrackets = "";
    expect(calculateBrackets(params)).toEqual(invalidResponse);
  });

  test("lowestPrice < 0", () => {
    const params = clone(baseParams);
    params.lowestPrice = "-1";
    expect(calculateBrackets(params)).toEqual(invalidResponse);
  });

  test("startPrice < 0", () => {
    const params = clone(baseParams);
    params.startPrice = "-1";
    expect(calculateBrackets(params)).toEqual(invalidResponse);
  });

  test("lowestPrice > highestPrice", () => {
    const params = clone(baseParams);
    params.lowestPrice = params.highestPrice;
    expect(calculateBrackets(params)).toEqual(invalidResponse);
  });

  test("totalBrackets === 0", () => {
    const params = clone(baseParams);
    params.totalBrackets = "0";
    expect(calculateBrackets(params)).toEqual(invalidResponse);
  });
});
