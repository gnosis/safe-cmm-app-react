import React, { useState } from "react";
import { Meta } from "@storybook/react/types-6-0";

import { TokenDetails } from "types";

import { Web3Context } from "components/Web3Provider";

import { PriceInput, Props } from ".";

const mockContext = {
  getErc20Details: async (address: string): Promise<TokenDetails> => {
    return {
      decimals: 18,
      name: "Token",
      symbol: "TKN",
      address,
    };
  },
};

export default {
  component: PriceInput,
  title: "PriceInput",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
  decorators: [
    (Story: any): JSX.Element => (
      <Web3Context.Provider value={mockContext}>
        <Story />
      </Web3Context.Provider>
    ),
  ],
} as Meta;

export const priceInputData = {
  tokenAddress: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
  labelText: "Best price",
  labelTooltip: "bla bla bla",
};

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
