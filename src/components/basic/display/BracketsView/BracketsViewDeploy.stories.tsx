import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";

import { BracketsViewView, Props } from "./viewer";

export default {
  component: BracketsViewView,
  title: "basic/display/BracketsView/Deploy",
  decorators: [(Story) => <div style={{ width: "400px" }}>{Story()}</div>],
} as Meta;

const requiredData: Props = { type: "deploy" };

const Template: Story<Props> = (props) => <BracketsViewView {...props} />;

export const Default = Template.bind({});
Default.args = {
  ...requiredData,
  leftBrackets: 3,
  rightBrackets: 2,

  bracketsSizes: [10, 15, 19, 25, 31], // must sum to 100

  baseTokenAddress: "0x",
  quoteTokenAddress: "0x",

  lowestPrice: "0",
  highestPrice: "0",
  startPrice: "5.8",
};

export const Minimal = Template.bind({});
Minimal.args = { ...requiredData };

export const AllBracketsLeft = Template.bind({});
AllBracketsLeft.args = {
  ...Default.args,
  leftBrackets: 3,
  rightBrackets: 0,
  bracketsSizes: [30, 32, 38],
};

export const AllBracketsRight = Template.bind({});
AllBracketsRight.args = {
  ...Default.args,
  leftBrackets: 0,
  rightBrackets: 3,
  bracketsSizes: [30, 32, 38],
};

export const StartPriceCloseToLowestPrice = Template.bind({});
StartPriceCloseToLowestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "1.1",
};

export const StartPriceAt25Percent = Template.bind({});
StartPriceAt25Percent.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "2",
};

export const StartPriceAt75Percent = Template.bind({});
StartPriceAt75Percent.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "4",
};

export const StartPriceCloseToHighestPrice = Template.bind({});
StartPriceCloseToHighestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "4.9",
};

export const StartPriceSmallerThanLowestPrice = Template.bind({});
StartPriceSmallerThanLowestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "0.1",
  leftBrackets: 0,
  rightBrackets: 5,
};

export const StartPriceEqualToLowestPrice = Template.bind({});
StartPriceEqualToLowestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "1",
  leftBrackets: 0,
  rightBrackets: 5,
};

export const StartPriceEqualToHighestPrice = Template.bind({});
StartPriceEqualToHighestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "5",
  leftBrackets: 5,
  rightBrackets: 0,
};

export const StartPriceGreaterThanHighestPrice = Template.bind({});
StartPriceGreaterThanHighestPrice.args = {
  ...Default.args,
  lowestPrice: "1",
  highestPrice: "5",
  startPrice: "5.5",
  leftBrackets: 5,
  rightBrackets: 0,
};
