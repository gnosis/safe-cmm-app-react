import type { MutableState, Mutator, Tools } from "final-form";

// Same as https://github.com/final-form/final-form-set-field-data/blob/master/src/setFieldData.js
// but with type definitions
export const setFieldData: Mutator = <T, Data extends {}>(
  args: [string, Data],
  state: MutableState<T>,
  tools: Tools<T>
) => {
  const [name, data] = args;
  const field = state.fields[name];
  if (field) {
    field.data = { ...field.data, ...data };
  }
};

// Mutator to set field's `value`
// `setFieldData` only allows to set field's metadata
export const setFieldValue: Mutator = <T>(
  args: [string, { value: string }],
  state: MutableState<T>,
  { changeValue }: Tools<T>
) => {
  const [field, { value }] = args;
  changeValue(state, field, () => value);
};
