import { Validator } from "./misc";

export const isRequired = (fieldName: string): Validator => (value) =>
  !value ? { label: `${fieldName} is required` } : undefined;
