export type ValidationError =
  | {
      label: string;
      body?: React.ReactNode;
    }
  | boolean;
export interface ValidationErrors {
  [field: string]: ValidationError;
}
