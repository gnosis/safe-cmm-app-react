import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { Web3Context } from "components/Web3Provider";

import { TokenDetails } from "types";

import { TokenDisplay, Props } from ".";

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

export const mockGetErc20DetailsDecorator = (Story: any): JSX.Element => (
  <Web3Context.Provider value={mockContext}>
    <Story />
  </Web3Context.Provider>
);

export default {
  component: TokenDisplay,
  title: "basic/display/TokenDisplay",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*(Data|mock.*)$/,
  decorators: [mockGetErc20DetailsDecorator],
} as Meta;

export const tokenDisplayData = {
  token: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
  size: "sm",
} as Props;

const Template = (args: Props): JSX.Element => <TokenDisplay {...args} />;

export const Default = Template.bind({});
Default.args = { ...tokenDisplayData };

export const Large = Template.bind({});
Large.args = { ...Default.args, size: "lg" };

export const TokenDetailsInput = Template.bind({});
TokenDetailsInput.args = {
  ...Default.args,
  token: {
    decimals: 9,
    name: "Other token",
    symbol: "OTR",
    address: "0x0000000000085d4780B73119b644AE5ecd22b376",
  },
};
