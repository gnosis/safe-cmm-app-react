import { ValidationError } from "./types";

export type Validator = (value: string) => undefined | ValidationError;

export const composeValidators = (...validators: Validator[]) => (
  value: string
): undefined | ValidationError =>
  validators.reduce(
    (error: ValidationError | undefined, validator: Validator) =>
      error || validator(value),
    undefined
  );
