import React, { useState } from "react";
import { Meta } from "@storybook/react/types-6-0";

import { mockGetErc20DetailsDecorator } from "mock/decorators";

import { PriceInput, Props } from ".";

export default {
  component: PriceInput,
  title: "basic/input/PriceInput",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
  decorators: [mockGetErc20DetailsDecorator],
} as Meta;

export const priceInputData = {
  tokenAddress: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
  labelText: "Best price",
  labelTooltip: "bla bla bla",
} as Props;

export const actionData = {};

const Template = (args: Props) => {
  const [value, setValue] = useState(args.value);

  const onSubmit = (e: React.FormEvent) => e.preventDefault();

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <PriceInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const Default = Template.bind({});
Default.args = { ...priceInputData, ...actionData };

export const LargeSize = Template.bind({});
LargeSize.args = { ...Default.args, labelSize: "xl" };

export const WithoutToken = Template.bind({});
WithoutToken.args = { ...Default.args, tokenAddress: undefined };

export const Error = Template.bind({});
Error.args = { ...Default.args, error: true };

export const Warning = Template.bind({});
Warning.args = { ...Default.args, warn: true };
