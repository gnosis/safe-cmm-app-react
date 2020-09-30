import { Validator } from "./misc";

export const isRequired = (): Validator => (fieldName: string) => async (
  value
) => (!value ? { label: `${fieldName} is required` } : undefined);
