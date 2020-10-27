import { Validator } from "./types";

export const isRequired = (): Validator => (fieldName: string) => async (
  value
) => (!value ? { label: `${fieldName} is required` } : undefined);
