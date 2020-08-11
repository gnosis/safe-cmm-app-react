import React, { useState } from "react";

import { TextFieldWithCustomLabel } from ".";

export default {
  component: TextFieldWithCustomLabel,
  title: "TextFieldWithCustomLabel",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
};

const onSubmit = (e: React.FormEvent) => e.preventDefault();

export const textFieldData = {
  id: "fieldId",
  customLabel: (
    <div
      style={{
        color: "black",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>Custom label</span>
      <a href="#">link</a>
    </div>
  ),
};

export const Default = () => {
  const [value, setValue] = useState("");
  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TextFieldWithCustomLabel
        {...textFieldData}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const CustomWidth = () => {
  const [value, setValue] = useState("");
  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TextFieldWithCustomLabel
        {...textFieldData}
        width={200}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const VeryLongValue = () => {
  const [value, setValue] = useState(
    "564897654165765132578645325746146254890849084089"
  );
  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TextFieldWithCustomLabel
        {...textFieldData}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const NoLabel = () => {
  const [value, setValue] = useState("");
  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TextFieldWithCustomLabel
        {...textFieldData}
        customLabel={undefined}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};
