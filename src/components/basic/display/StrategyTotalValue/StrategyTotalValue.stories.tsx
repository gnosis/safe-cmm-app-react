import React from "react";
import Decimal from "decimal.js";
import { Meta, Story } from "@storybook/react/types-6-0";

import { StrategyTotalValueViewer, Props } from "./viewer";

export default {
  component: StrategyTotalValueViewer,
  title: "basic/display/StrategyTotalValue",
} as Meta;

const Template: Story<Props> = (props) => (
  <StrategyTotalValueViewer {...props} />
);

const defaultData: Props = {
  totalValue: new Decimal("1055987"),
  holdValue: new Decimal("1055000"),
  roi: new Decimal("0.0134"),
  apy: new Decimal("-0.0003"),
};

export const Default = Template.bind({});
Default.args = { ...defaultData };

export const NoRoiNorApy = Template.bind({});
NoRoiNorApy.args = { ...Default.args, roi: undefined, apy: undefined };
