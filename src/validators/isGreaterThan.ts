import { Validator } from "./misc";

export const isGreaterThan = (minValue: number): Validator => (fieldName) => (
  value
) =>
  +value <= minValue
    ? { label: `${fieldName} must be greater than ${minValue}` }
    : undefined;
