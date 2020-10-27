import { Validator } from "./types";

export const isNumber = (checkInteger?: boolean): Validator => (
  fieldName: string
) => async (value) =>
  isNaN(+value)
    ? { label: `${fieldName} must be a number` }
    : checkInteger && !Number.isInteger(+value)
    ? { label: `${fieldName} must be an integer` }
    : undefined;
