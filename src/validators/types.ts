export interface ValidationError {
  label: string;
  body?: React.ReactNode;
}
export interface ValidationErrors {
  [field: string]: ValidationError;
}
