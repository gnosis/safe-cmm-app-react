import { FieldState } from "final-form";
import { ValidationError } from "./types";

export type Validator = (
  displayFieldName: string
) => (
  value: string,
  allValues?: object,
  meta?: FieldState<string>
) => Promise<undefined | ValidationError>;

export const composeValidators = (
  displayFieldName: string,
  validators: Validator[]
) => async (
  value: string,
  allValues?: object,
  meta?: FieldState<string>
): Promise<undefined | ValidationError> => {
  for (const validator of validators) {
    const validatorFn = validator(displayFieldName);
    const result = await validatorFn(value, allValues, meta);
    if (result) {
      return result;
    }
  }
  return undefined;
};
