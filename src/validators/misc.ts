import { FieldState } from "final-form";
import { ValidationError } from "./types";

export type Validator = (
  displayFieldName: string
) => (
  value: string,
  allValues?: object,
  meta?: FieldState<string>
) => undefined | ValidationError;

export const composeValidators = (
  displayFieldName: string,
  validators: Validator[]
) => (
  value: string,
  allValues?: object,
  meta?: FieldState<string>
): undefined | ValidationError =>
  validators.reduce(
    (error: ValidationError | undefined, validator: Validator) =>
      error || validator(displayFieldName)(value, allValues, meta),
    undefined
  );
