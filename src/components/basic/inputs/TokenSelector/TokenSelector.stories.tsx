import React from "react";
import BN from "bn.js";
import { Meta } from "@storybook/react/types-6-0";
import { action } from "@storybook/addon-actions";

import { TokenSelectorView, TokenSelectorViewProps } from ".";

export default {
  component: TokenSelectorView,
  title: "dddddd",
  excludeStories: /.*Data$/,
} as Meta;

export const tokenSelectorData = {
  items: [
    {
      id: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      label: "WETH",
      subLabel: "Wrapped ETH",
      iconUrl: "",
    }, // weth
    {
      id: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      label: "USDC",
      subLabel: "",
      iconUrl: "",
    }, // usdc
    {
      id: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      label: "DAI",
      subLabel: "",
      iconUrl: "",
    }, // dai
    {
      id: "0x6810e776880C02933D47DB1b9fc05908e5386b96",
      label: "GNO",
      subLabel: "",
      iconUrl: "",
    }, // gno
    {
      id: "0x1A5F9352Af8aF974bFC03399e3767DF6370d82e4",
      label: "OWL",
      subLabel: "",
      iconUrl: "",
    }, // owl
  ],
  label: "Pick Token A",
  tooltip: "You should pick a token",
  tokenBalance: new BN(10000000000000000000000),
  tokenDetails: {
    address: "0x1A5F9352Af8aF974bFC03399e3767DF6370d82e4",
    name: "",
    symbol: "OWL",
    decimals: 18,
  },
};

export const actionData = { onChange: action("onChange") };

const Template = (args: TokenSelectorViewProps): JSX.Element => {
  const onSubmit = (e: React.FormEvent) => e.preventDefault();

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <TokenSelectorView {...args} />
    </form>
  );
};

export const Default = Template.bind({});
Default.args = { ...tokenSelectorData, ...actionData };
