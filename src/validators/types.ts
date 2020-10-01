import { ValidationErrors as FFValidationErrors } from "final-form";

export type ValidationError =
  | {
      label: string;
      children?: React.ReactNode;
    }
  | boolean;
export interface ValidationErrors extends FFValidationErrors {
  [field: string]: ValidationError;
}
