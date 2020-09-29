import { Validator } from "./misc";

export const isNumber = (checkInteger?: boolean): Validator => (
  fieldName: string
) => (value) =>
  isNaN(+value)
    ? { label: `${fieldName} must be a number` }
    : checkInteger && !Number.isInteger(+value)
    ? { label: `${fieldName} must be an integer` }
    : undefined;
