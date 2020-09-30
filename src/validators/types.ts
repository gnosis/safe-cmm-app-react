import { ValidationErrors as FFValidationErrors } from "final-form";

export type ValidationError =
  | {
      label: string;
      body?: React.ReactNode;
    }
  | boolean;
export interface ValidationErrors extends FFValidationErrors {
  [field: string]: ValidationError;
}
