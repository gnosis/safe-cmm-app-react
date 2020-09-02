import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { mockGetErc20DetailsDecorator } from "../TokenDisplay/TokenDisplay.stories";

import { MarketPriceViewer, MarketPriceViewerProps } from "./viewer";
import { TokenDetails } from "types";

export default {
  component: MarketPriceViewer,
  title: "basic/display/MarketPrice",
  excludeStories: /Data$/,
  decorators: [mockGetErc20DetailsDecorator],
} as Meta;

export const marketPriceData = {
  price: "1.232",
  isPriceLoading: false,
  tokenA: {
    symbol: "TKNA",
    name: "Token A",
    decimals: 5,
    address: "0x1A5F9352Af8aF974bFC03399e3767DF6370d82e4",
  },
  tokenB: {
    symbol: "TKNB",
    name: "Token B",
    decimals: 15,
    address: "0x0000000000085d4780B73119b644AE5ecd22b376",
  },
  priceUrl: "https://prices.com.for.real/TKNA/TKNB",
} as MarketPriceViewerProps;

const Template = (args: MarketPriceViewerProps): JSX.Element => (
  <MarketPriceViewer {...args} />
);

export const Default = Template.bind({});
Default.args = { ...marketPriceData };

export const PriceIsLoading = Template.bind({});
PriceIsLoading.args = { ...marketPriceData, isPriceLoading: true };

export const NoPrice = Template.bind({});
NoPrice.args = { ...marketPriceData, price: undefined };
