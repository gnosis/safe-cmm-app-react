import React, { useState } from "react";
import { Meta } from "@storybook/react/types-6-0";

import { TokenDetails } from "types";

import { mockGetErc20DetailsDecorator } from "mock/decorators";

import { NumberInput, Props } from ".";

export default {
  component: NumberInput,
  title: "basic/input/NumberInput",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
  decorators: [mockGetErc20DetailsDecorator],
} as Meta;

export const numberInputData = {
  tokenAddress: "0x123123123",
  customLabel: <div>Label</div>,
} as Props;

const Template = (args: Props) => {
  const [value, setValue] = useState(args.value);

  const onSubmit = (e: React.FormEvent) => e.preventDefault();

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <NumberInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const Default = Template.bind({});
Default.args = { ...numberInputData };

export const CustomWidth = Template.bind({});
CustomWidth.args = { ...numberInputData, width: "120px" };

export const WithoutToken = Template.bind({});
WithoutToken.args = { ...numberInputData, tokenAddress: undefined };
