import { FieldState, ValidationErrors as FFValidationErrors } from "final-form";

export type Validator = (
  displayFieldName: string
) => (
  value: string,
  allValues?: object,
  meta?: FieldState<string>
) => Promise<undefined | ValidationError>;

export type ValidationError =
  | {
      label: string;
      children?: React.ReactNode;
    }
  | boolean;
export interface ValidationErrors extends FFValidationErrors {
  [field: string]: ValidationError;
}
