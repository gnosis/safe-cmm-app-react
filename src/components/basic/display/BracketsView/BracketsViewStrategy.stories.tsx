import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { BracketsViewView, Props } from "./viewer";
import { Default as DeployDefault } from "./BracketsViewDeploy.stories";

export default {
  component: BracketsViewView,
  title: "basic/display/BracketsView/Strategy",
  decorators: [(Story) => <div style={{ width: "800px" }}>{Story()}</div>],
} as Meta;

const requiredData: Props = { type: "strategy" };

export const Default = DeployDefault.bind({});
Default.args = { ...DeployDefault.args, ...requiredData };

export const Minimal = DeployDefault.bind({});
Minimal.args = { ...requiredData };

export const StartPriceCloseToLowestPrice = DeployDefault.bind({});
StartPriceCloseToLowestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "1.1",
};

export const StartPriceAtLowerBoundary = DeployDefault.bind({});
StartPriceAtLowerBoundary.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "1.41",
};

export const StartPriceAtUpperBoundary = DeployDefault.bind({});
StartPriceAtUpperBoundary.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "4.59",
};

export const StartPriceCloseToHighestPrice = DeployDefault.bind({});
StartPriceCloseToHighestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "4.9",
};

export const StartPriceSmallerThanLowestPrice = DeployDefault.bind({});
StartPriceSmallerThanLowestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "0.1",
  leftBrackets: 0,
  rightBrackets: 5,
};

export const StartPriceEqualToLowestPrice = DeployDefault.bind({});
StartPriceEqualToLowestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "1",
  leftBrackets: 0,
  rightBrackets: 5,
};

export const StartPriceEqualToHighestPrice = DeployDefault.bind({});
StartPriceEqualToHighestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "5",
  leftBrackets: 5,
  rightBrackets: 0,
};

export const StartPriceGreaterThanHighestPrice = DeployDefault.bind({});
StartPriceGreaterThanHighestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "5.5",
  leftBrackets: 5,
  rightBrackets: 0,
};
