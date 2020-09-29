import { Validator } from "./misc";

export const isRequired = (): Validator => (fieldName: string) => (value) =>
  !value ? { label: `${fieldName} is required` } : undefined;
