import React from "react";
import Decimal from "decimal.js";
import { Meta, Story } from "@storybook/react/types-6-0";

import { BracketsTable, Props } from ".";

export default {
  component: BracketsTable,
  title: "basic/display/BracketsTable",
  decorators: [(Story) => <div style={{ width: "400px" }}>{Story()}</div>],
} as Meta;

const Template: Story<Props> = (props) => <BracketsTable {...props} />;

const defaultData: Props = {
  type: "left",
  baseTokenAddress: "0x000",
  quoteTokenAddress: "0x001",
  brackets: [
    {
      lowPrice: new Decimal("1"),
      highPrice: new Decimal("1.1"),
      balanceBase: "50",
      balanceQuote: "0",
    },
    {
      lowPrice: new Decimal("1.1"),
      highPrice: new Decimal("1.2"),
      balanceBase: "100",
      balanceQuote: "0",
    },
    {
      lowPrice: new Decimal("1.2"),
      highPrice: new Decimal("1.3"),
      balanceBase: "111",
      balanceQuote: "0",
    },
    {
      lowPrice: new Decimal("1.3"),
      highPrice: new Decimal("1.4"),
      balanceBase: "57",
      balanceQuote: "0",
    },
    {
      lowPrice: new Decimal("1.4"),
      highPrice: new Decimal("1.5"),
      balanceBase: "198",
      balanceQuote: "0",
    },
  ],
};

export const Default = Template.bind({});
Default.args = { ...defaultData };

export const RightBrackets = Template.bind({});
RightBrackets.args = { ...defaultData, type: "right" };
