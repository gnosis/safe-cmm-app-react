import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { TokenDisplay, Props } from ".";

export default {
  component: TokenDisplay,
  title: "TokenDisplay",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
} as Meta;

export const tokenDisplayData = {
  tokenDetails: {
    decimals: 18,
    name: "Token",
    symbol: "TKN",
    address: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
  },
  size: "sm",
};

const Template = (args: Props): JSX.Element => <TokenDisplay {...args} />;

export const Default = Template.bind({});
Default.args = { ...tokenDisplayData };

export const Large = Template.bind({});
Large.args = { ...Default.args, size: "lg" };
