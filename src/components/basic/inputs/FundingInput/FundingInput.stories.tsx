import React, { useState } from "react";
import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react/types-6-0";

import { TokenDetails } from "types";

import { Web3Context } from "components/Web3Provider";

import { FundingInput, Props } from ".";

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
  component: FundingInput,
  title: "basic/input/FundingInput",
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

export const fundingInputData = {
  amountPerBracket: "5",
  tokenAddress: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
};

export const actionData = {
  onMaxClick: action("onMaxClick"),
};

// Template pattern: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args: Props) => {
  const [value, setValue] = useState(args.value);

  const onSubmit = (e: React.FormEvent) => e.preventDefault();

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <FundingInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const Default = Template.bind({});
Default.args = { ...fundingInputData, ...actionData };

export const VeryLongValue = Template.bind({});
VeryLongValue.args = {
  ...Default.args,
  value: "1231231231235345345.312",
  amountPerBracket: "12351514625333.3",
};

export const ErrorInput = Template.bind({});
ErrorInput.args = { ...Default.args, error: true };

export const WarningInput = Template.bind({});
WarningInput.args = { ...Default.args, warn: true };
