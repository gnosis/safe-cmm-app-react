import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";

import { TradesView, Props } from "./TradesView";
import Decimal from "decimal.js";

export default {
  component: TradesView,
  title: "basic/display/Trades",
} as Meta;

const Template: Story<Props> = (props) => <TradesView {...props} />;

const defaultData: Props = {
  trades: [
    {
      type: "sell",
      baseTokenSymbol: "ETH",
      quoteTokenSymbol: "DAI",
      baseTokenAmount: new Decimal("0.3"),
      quoteTokenAmount: new Decimal("103.11854"),
      price: new Decimal("343.34295"),
      date: new Date(2020, 6, 21),
    },
    {
      type: "buy",
      baseTokenSymbol: "ETH",
      quoteTokenSymbol: "DAI",
      baseTokenAmount: new Decimal("0.3"),
      quoteTokenAmount: new Decimal("103.11854"),
      price: new Decimal("301.7422"),
      date: new Date(2020, 6, 22),
    },
  ],
  totalTrades: 50,
};

export const Default = Template.bind({});
Default.args = { ...defaultData };

export const NoTrades = Template.bind({});
NoTrades.args = { trades: [], totalTrades: 0 };
