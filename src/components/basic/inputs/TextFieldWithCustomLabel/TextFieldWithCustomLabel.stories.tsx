import React, { useState } from "react";
import { Meta, Story } from "@storybook/react/types-6-0";

import { TextFieldWithCustomLabel, Props } from ".";

export default {
  component: TextFieldWithCustomLabel,
  title: "basic/input/TextFieldWithCustomLabel",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
} as Meta;

export const textFieldData: Props = {
  value: "",
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

const Template: Story<Props> = (args) => {
  const { value: initialValue, ...rest } = args;
  const [value, setValue] = useState(initialValue);

  console.log(`wwwwww`, args);

  const onSubmit = (e: React.FormEvent): void => e.preventDefault();

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TextFieldWithCustomLabel
        {...rest}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const Default = Template.bind({});
Default.args = { ...textFieldData };

export const CustomWidth = Template.bind({});
CustomWidth.args = { ...Default.args, width: 200 };

export const VeryLongValue = Template.bind({});
VeryLongValue.args = {
  ...Default.args,
  value: "564897654165765132578645325746146254890849084089",
};

export const WithAdornmentsAndLongInput = Template.bind({});
WithAdornmentsAndLongInput.args = {
  ...Default.args,
  value: "38798749879879879543574.2468165735484657465",
  startAdornment: <strong>Buy</strong>,
  endAdornment: <strong>DAI</strong>,
};

export const WithErrorMessage = Template.bind({});
WithErrorMessage.args = { ...Default.args, meta: { error: "Invalid input" } };

export const WithErrorHighlightWithoutMessage = Template.bind({});
WithErrorHighlightWithoutMessage.args = { ...Default.args, error: true };

export const WithWarningHighlight = Template.bind({});
WithWarningHighlight.args = { ...Default.args, warn: true };
