import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";

import { BracketsViewView, Props } from "./viewer";

export default {
  component: BracketsViewView,
  title: "basic/display/BracketsView",
  decorators: [(Story) => <div style={{ width: "400px" }}>{Story()}</div>],
} as Meta;

const minimumData: Props = { type: "deploy" };

const Template: Story<Props> = (props) => <BracketsViewView {...props} />;

export const DeployDefault = Template.bind({});
DeployDefault.args = {
  ...minimumData,
  totalBrackets: 5,
  leftBrackets: 3,
  rightBrackets: 2,

  baseTokenAddress: "0x",
  quoteTokenAddress: "0x",

  lowestPrice: "0",
  highestPrice: "0",
};

export const DeployMinimal = Template.bind({});
DeployMinimal.args = { ...minimumData };

export const DeployAllLeft = Template.bind({});
DeployAllLeft.args = {
  ...DeployDefault.args,
  totalBrackets: 3,
  leftBrackets: 3,
  rightBrackets: 0,
};

export const DeployAllRight = Template.bind({});
DeployAllRight.args = {
  ...DeployDefault.args,
  totalBrackets: 3,
  leftBrackets: 0,
  rightBrackets: 3,
};
