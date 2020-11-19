import { safeAddDecimals } from "utils/calculations";
import { ONE_DECIMAL, ONE_HUNDRED_DECIMAL } from "utils/constants";

test("Both parameters null", () => {
  expect(safeAddDecimals(null, null)).toEqual(undefined);
});

test("First parameter null", () => {
  expect(safeAddDecimals(null, ONE_DECIMAL)).toEqual(ONE_DECIMAL);
});

test("Second parameter null", () => {
  expect(safeAddDecimals(ONE_DECIMAL, null)).toEqual(ONE_DECIMAL);
});

test("Both present", () => {
  expect(safeAddDecimals(ONE_HUNDRED_DECIMAL, ONE_DECIMAL)).toEqual(
    ONE_DECIMAL.add(ONE_HUNDRED_DECIMAL)
  );
});
