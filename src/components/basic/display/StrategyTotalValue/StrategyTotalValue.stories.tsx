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
  totalValue: { value: new Decimal("1055987"), isLoading: false },
  holdValue: { value: new Decimal("1055000"), isLoading: false },
  roi: { value: new Decimal("0.0134"), isLoading: false },
  apr: { value: new Decimal("-0.0003"), isLoading: false },
};

export const Default = Template.bind({});
Default.args = { ...defaultData };

export const NoRoiNorApy = Template.bind({});
NoRoiNorApy.args = { ...Default.args, roi: undefined, apy: undefined };
