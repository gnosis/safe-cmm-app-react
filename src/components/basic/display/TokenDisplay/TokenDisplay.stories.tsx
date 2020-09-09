import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { mockGetErc20DetailsDecorator } from "mock/decorators";

import { TokenDisplay, Props } from ".";

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
