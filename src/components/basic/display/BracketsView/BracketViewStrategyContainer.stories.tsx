import React from "react";
import Decimal from "decimal.js";
import { Meta, Story } from "@storybook/react/types-6-0";

import { BracketsViewer, Props } from ".";

export default {
  component: BracketsViewer,
  title: "basic/display/BracketsView/Strategy Container",
  decorators: [(Story) => <div style={{ width: "800px" }}>{Story()}</div>],
} as Meta;

const requiredData: Props = {
  type: "strategy",
  // the following fields are calculated internally for `type=strategy`
  startPrice: undefined,
  leftBrackets: undefined,
  rightBrackets: undefined,
};

const Template: Story<Props> = (args) => <BracketsViewer {...args} />;

export const Default = Template.bind({});
Default.args = {
  ...requiredData,
  totalBrackets: 5,
  baseTokenAddress: "0x",
  quoteTokenAddress: "0x",
  lowestPrice: "300",
  highestPrice: "350",
};
Default.parameters = { useGetPrice: { price: new Decimal("324.2344") } };
