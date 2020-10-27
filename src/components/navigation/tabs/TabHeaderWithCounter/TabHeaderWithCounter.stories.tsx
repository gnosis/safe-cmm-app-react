import React from "react";

import { TabHeaderWithCounter, Props as TabHeaderWithCounterProps } from ".";
import { Meta } from "@storybook/react/types-6-0";

export default {
  component: TabHeaderWithCounter,
  title: "navigation/tabs/TabHeaderWithCounter",
} as Meta;

const Template = (args: TabHeaderWithCounterProps): JSX.Element => (
  <TabHeaderWithCounter {...args} />
);

export const Default = Template.bind({});
Default.args = {
  children: "Tab Header",
  count: 2,
  name: "default",
  onClick: () => window.alert("Clicked Tab"),
  active: true,
};

export const Inactive = Template.bind({});
Inactive.args = {
  children: "Inactive Tab Header",
  count: 0,
  name: "default",
  inactiveTextColor: "#000",
  inactiveBgColor: "#f3f3f3",
  onClick: () => window.alert("Clicked Tab"),
  active: false,
};
