import { Validator } from "./misc";

export const isNumber = (
  fieldName: string,
  checkInteger?: boolean
): Validator => (value) =>
  isNaN(+value)
    ? { label: `${fieldName} must be a number` }
    : checkInteger && !Number.isInteger(+value)
    ? { label: `${fieldName} must be an integer` }
    : undefined;
