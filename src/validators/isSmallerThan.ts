import { Validator } from "./misc";

export const isSmallerThan = (
  fieldName: string,
  maxValue: number
): Validator => (value) =>
  +value >= maxValue
    ? { label: `${fieldName} must be smaller than ${maxValue}` }
    : undefined;
