import React from "react";
import { Meta, Story } from "@storybook/react";

import { Props, Text } from ".";

export default {
  component: Text,
  title: "basic/display/Text",
} as Meta;

const Template: Story<Props> = (args) => <Text {...args} />;

export const Default = Template.bind({});
Default.args = { children: "Default text" };

export const Xs = Template.bind({});
Xs.args = { children: "Extra small", size: "xs" };

export const Lg = Template.bind({});
Lg.args = { children: "Large", size: "lg" };

export const Xl = Template.bind({});
Xl.args = { children: "Extra Large", size: "xl" };
