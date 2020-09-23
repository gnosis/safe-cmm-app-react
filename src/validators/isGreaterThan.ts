import { Validator } from "./misc";

export const isGreaterThan = (
  fieldName: string,
  minValue: number
): Validator => (value) =>
  +value <= minValue
    ? { label: `${fieldName} must be greater than ${minValue}` }
    : undefined;
