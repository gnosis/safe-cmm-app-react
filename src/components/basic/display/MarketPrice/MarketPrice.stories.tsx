import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { MarketPriceViewer, MarketPriceViewerProps } from "./viewer";
import { MarketPrice, Props } from ".";
import Decimal from "decimal.js";

export default {
  component: MarketPriceViewer,
  title: "basic/display/MarketPrice",
  excludeStories: /(Data|mock.*)$/,
} as Meta;

// Viewer

export const marketPriceData: MarketPriceViewerProps = {
  price: "1.232",
  isPriceLoading: false,
  baseTokenAddress: "0x1A5F9352Af8aF974bFC03399e3767DF6370d82e4",
  quoteTokenAddress: "0x0000000000085d4780B73119b644AE5ecd22b376",
  priceUrl: "https://prices.com.for.real/TKNA/TKNB",
};

const Template = (args: MarketPriceViewerProps): JSX.Element => (
  <MarketPriceViewer {...args} />
);

export const Default = Template.bind({});
Default.args = { ...marketPriceData };

export const PriceIsLoading = Template.bind({});
PriceIsLoading.args = { ...marketPriceData, isPriceLoading: true };

export const NoPrice = Template.bind({});
NoPrice.args = { ...marketPriceData, price: undefined };

// Container

export const containerData: Props = {};

const ContainerTemplate = (args: Props): JSX.Element => {
  return <MarketPrice {...args} />;
};

export const DefaultContainer = ContainerTemplate.bind({});
DefaultContainer.args = { ...containerData };

export const FilledContainer = ContainerTemplate.bind({});
FilledContainer.args = {
  ...DefaultContainer.args,
  baseTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  quoteTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
};
FilledContainer.parameters = {
  useGetPrice: { price: new Decimal("334.2344") },
};

export const LoadingContainer = ContainerTemplate.bind({});
LoadingContainer.args = {
  ...DefaultContainer.args,
};
LoadingContainer.parameters = { useGetPrice: { isLoading: true } };
