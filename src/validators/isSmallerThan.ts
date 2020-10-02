import { Validator } from "./types";

export const isSmallerThan = (maxValue: number): Validator => (
  fieldName
) => async (value) =>
  +value >= maxValue
    ? { label: `${fieldName} must be smaller than ${maxValue}` }
    : undefined;
