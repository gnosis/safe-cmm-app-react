import React, { useState } from "react";

import { TextFieldWithCustomLabel } from ".";

export default {
  component: TextFieldWithCustomLabel,
  title: "basic/input/TextFieldWithCustomLabel",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
};

const onSubmit = (e: React.FormEvent): void => e.preventDefault();

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

export const Default: React.FC = () => {
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

export const CustomWidth: React.FC = () => {
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

export const VeryLongValue: React.FC = () => {
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

export const WithAdornmentsAndLongInput: React.FC = () => {
  const [value, setValue] = useState(
    "38798749879879879543574.2468165735484657465"
  );
  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TextFieldWithCustomLabel
        {...textFieldData}
        startAdornment={<strong>Buy</strong>}
        endAdornment={<strong>DAI</strong>}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const WithErrorMessage: React.FC = () => {
  const [value, setValue] = useState("kajsdla");
  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TextFieldWithCustomLabel
        {...textFieldData}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        meta={{ error: "Invalid input" }}
      />
    </form>
  );
};

export const WithErrorHighlightWithoutMessage: React.FC = () => {
  const [value, setValue] = useState("");
  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TextFieldWithCustomLabel
        {...textFieldData}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error
      />
    </form>
  );
};

export const WithWarningHighlight: React.FC = () => {
  const [value, setValue] = useState("");
  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TextFieldWithCustomLabel
        {...textFieldData}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        warn
      />
    </form>
  );
};
