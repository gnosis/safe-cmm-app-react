import { calculateApr } from "utils/calculations";
import {
  ONE_DECIMAL,
  ONE_HUNDRED_DECIMAL,
  ZERO_DECIMAL,
} from "utils/constants";

const MS_IN_A_DAY = 1000 * 60 * 60 * 24;
const startDate = new Date(Date.now() - MS_IN_A_DAY); // 1 day in the past

describe("Invalid input", () => {
  test("Both values undefined", () => {
    expect(calculateApr(undefined, undefined, startDate)).toEqual(undefined);
  });

  test("First value undefined", () => {
    expect(calculateApr(undefined, ONE_DECIMAL, startDate)).toEqual(undefined);
  });

  test("Second value undefined", () => {
    expect(calculateApr(ONE_DECIMAL, undefined, startDate)).toEqual(undefined);
  });

  test("No endDate, startDate on the future", () => {
    const startDate = new Date(Date.now() + MS_IN_A_DAY); // 1 day in the future

    expect(calculateApr(ONE_DECIMAL, ONE_DECIMAL, startDate)).toEqual(
      undefined
    );
  });
  test("With endDate, startDate after endDate", () => {
    const endDate = new Date(Date.now() - MS_IN_A_DAY * 3); // 2 days before start

    expect(calculateApr(ONE_DECIMAL, ONE_DECIMAL, startDate, endDate)).toEqual(
      undefined
    );
  });
});

describe("Valid input", () => {
  const startDate = new Date(Date.now() - MS_IN_A_DAY * 365); // 1 year in the past

  test("Positive APR", () => {
    const initialValue = ONE_HUNDRED_DECIMAL;
    const currentValue = ONE_HUNDRED_DECIMAL.add(ONE_DECIMAL);

    expect(calculateApr(currentValue, initialValue, startDate)).toEqual(
      ONE_DECIMAL.div(ONE_HUNDRED_DECIMAL)
    );
  });

  test("Negative APR", () => {
    const initialValue = ONE_HUNDRED_DECIMAL;
    const currentValue = ONE_HUNDRED_DECIMAL.minus(ONE_DECIMAL);

    expect(calculateApr(currentValue, initialValue, startDate)).toEqual(
      ONE_DECIMAL.div(ONE_HUNDRED_DECIMAL).negated()
    );
  });

  test("Positive APR", () => {
    const initialValue = ONE_HUNDRED_DECIMAL;
    const currentValue = ONE_HUNDRED_DECIMAL;

    expect(calculateApr(currentValue, initialValue, startDate)).toEqual(
      ZERO_DECIMAL
    );
  });

  test("With endDate", () => {
    const initialValue = ONE_HUNDRED_DECIMAL;
    const currentValue = ONE_HUNDRED_DECIMAL.add(ONE_DECIMAL);
    const endDate = new Date(Date.now() - MS_IN_A_DAY * 364); // 1 day difference from start

    expect(
      calculateApr(currentValue, initialValue, startDate, endDate)
    ).toEqual(ONE_DECIMAL.div(ONE_HUNDRED_DECIMAL).times("365"));
  });
});
