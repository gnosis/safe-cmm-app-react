import React, { useState } from "react";
import { Meta } from "@storybook/react/types-6-0";

import { TokenDetails } from "types";

import { Web3Context } from "components/Web3Provider";

import { NumberInput, Props } from ".";

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
  component: NumberInput,
  title: "NumberInput",
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

export const numberInputData = {
  tokenAddress: "0x123123123",
  customLabel: <div>Label</div>,
};

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
