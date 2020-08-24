import React, { useState } from "react";
import { Meta } from "@storybook/react/types-6-0";

import { BracketsInput, Props } from ".";
import { action } from "@storybook/addon-actions";

export default {
  component: BracketsInput,
  title: "BracketsInput",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
} as Meta;

export const bracketsInputData = {};

export const actionData = { onChange: action("onChange") };

const Template = (args: Props): JSX.Element => {
  const [value, setValue] = useState(args.value);

  const onSubmit = (e: React.FormEvent) => e.preventDefault();

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <BracketsInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const Default = Template.bind({});
Default.args = { ...bracketsInputData, ...actionData };

export const Filled = Template.bind({});
Filled.args = { ...Default.args, width: 70, value: "7" };
