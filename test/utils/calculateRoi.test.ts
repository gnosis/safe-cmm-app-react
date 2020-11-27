import { calculateRoi } from "utils/calculations";
import {
  ONE_DECIMAL,
  ONE_HUNDRED_DECIMAL,
  ZERO_DECIMAL,
} from "utils/constants";

describe("Invalid input", () => {
  test("Both inputs undefined", () => {
    expect(calculateRoi(undefined, undefined)).toEqual(undefined);
  });

  test("First input undefined", () => {
    expect(calculateRoi(undefined, ONE_DECIMAL)).toEqual(undefined);
  });

  test("Second input undefined", () => {
    expect(calculateRoi(ONE_DECIMAL, undefined)).toEqual(undefined);
  });
});

describe("Valid input", () => {
  test("Positive ROI", () => {
    const initialValue = ONE_HUNDRED_DECIMAL;
    const currentValue = ONE_HUNDRED_DECIMAL.add(ONE_DECIMAL);

    expect(calculateRoi(currentValue, initialValue)).toEqual(
      ONE_DECIMAL.div(ONE_HUNDRED_DECIMAL)
    );
  });

  test("Negative ROI", () => {
    const initialValue = ONE_HUNDRED_DECIMAL;
    const currentValue = ONE_HUNDRED_DECIMAL.minus(ONE_DECIMAL);

    expect(calculateRoi(currentValue, initialValue)).toEqual(
      ONE_DECIMAL.div(ONE_HUNDRED_DECIMAL).negated()
    );
  });

  test("Neutral ROI", () => {
    expect(calculateRoi(ONE_HUNDRED_DECIMAL, ONE_HUNDRED_DECIMAL)).toEqual(
      ZERO_DECIMAL
    );
  });
});
