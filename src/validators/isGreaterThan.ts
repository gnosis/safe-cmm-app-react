import { Validator } from "./misc";

export const isGreaterThan = (minValue: number): Validator => (
  fieldName
) => async (value) =>
  +value <= minValue
    ? { label: `${fieldName} must be greater than ${minValue}` }
    : undefined;
