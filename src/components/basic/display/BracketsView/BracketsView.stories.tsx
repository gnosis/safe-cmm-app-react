import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";

import { BracketsViewView, Props } from "./viewer";

export default {
  component: BracketsViewView,
  title: "basic/display/BracketsView",
  decorators: [(Story) => <div style={{ width: "400px" }}>{Story()}</div>],
} as Meta;

const requiredData: Props = { type: "deploy" };

const Template: Story<Props> = (props) => <BracketsViewView {...props} />;

export const DeployDefault = Template.bind({});
DeployDefault.args = {
  ...requiredData,
  totalBrackets: 5,
  leftBrackets: 3,
  rightBrackets: 2,

  baseTokenAddress: "0x",
  quoteTokenAddress: "0x",

  lowestPrice: "0",
  highestPrice: "0",
  startPrice: "5.8",
};

export const DeployMinimal = Template.bind({});
DeployMinimal.args = { ...requiredData };

export const DeployAllBracketsLeft = Template.bind({});
DeployAllBracketsLeft.args = {
  ...DeployDefault.args,
  totalBrackets: 3,
  leftBrackets: 3,
  rightBrackets: 0,
};

export const DeployAllBracketsRight = Template.bind({});
DeployAllBracketsRight.args = {
  ...DeployDefault.args,
  totalBrackets: 3,
  leftBrackets: 0,
  rightBrackets: 3,
};

export const DeployStartPriceCloseToLowestPrice = Template.bind({});
DeployStartPriceCloseToLowestPrice.args = {
  ...DeployDefault.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "1.1",
};

export const DeployStartPriceAt25Percent = Template.bind({});
DeployStartPriceAt25Percent.args = {
  ...DeployDefault.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "2",
};

export const DeployStartPriceAt75Percent = Template.bind({});
DeployStartPriceAt75Percent.args = {
  ...DeployDefault.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "4",
};

export const DeployStartPriceCloseToHighestPrice = Template.bind({});
DeployStartPriceCloseToHighestPrice.args = {
  ...DeployDefault.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "4.9",
};

export const DeployStartPriceSmallerThanLowestPrice = Template.bind({});
DeployStartPriceSmallerThanLowestPrice.args = {
  ...DeployDefault.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "0.1",
  leftBrackets: 0,
  rightBrackets: 5,
};

export const DeployStartPriceGreaterThanHighestPrice = Template.bind({});
DeployStartPriceGreaterThanHighestPrice.args = {
  ...DeployDefault.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "5.5",
  leftBrackets: 5,
  rightBrackets: 0,
};
