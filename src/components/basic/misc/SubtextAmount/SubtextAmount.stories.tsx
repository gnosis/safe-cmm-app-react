import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { SubtextAmount, Props } from ".";

export default {
  component: SubtextAmount,
  title: "basic/misc/SubtextAmount",
} as Meta;

const Template = (props: Props): JSX.Element => <SubtextAmount {...props} />;

export const Default = Template.bind({});
Default.args = { subtext: "Short subtext:", amount: "~ $1,323,545.2" };

export const AmountIsAComponent = Template.bind({});
AmountIsAComponent.args = {
  subtext: "Something else:",
  amount: <span>1250 ETH</span>,
};
