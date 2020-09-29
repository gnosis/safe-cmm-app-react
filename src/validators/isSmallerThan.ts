import { Validator } from "./misc";

export const isSmallerThan = (maxValue: number): Validator => (fieldName) => (
  value
) =>
  +value >= maxValue
    ? { label: `${fieldName} must be smaller than ${maxValue}` }
    : undefined;
