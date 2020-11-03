import React from "react";
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
  tokenAddress: "0x000",
  brackets: [
    { lowPrice: "1", highPrice: "1.1", balance: "50" },
    { lowPrice: "1.1", highPrice: "1.2", balance: "100" },
    { lowPrice: "1.2", highPrice: "1.3", balance: "111" },
    { lowPrice: "1.3", highPrice: "1.4", balance: "57" },
    { lowPrice: "1.4", highPrice: "1.5", balance: "198" },
  ],
};

export const Default = Template.bind({});
Default.args = { ...defaultData };

export const RightBrackets = Template.bind({});
RightBrackets.args = { ...defaultData, type: "right" };
