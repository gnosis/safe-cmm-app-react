import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";

import { Arrow, Props } from ".";

export default {
  component: Arrow,
  title: "basic/display/Arrow",
} as Meta;

const Template: Story<Props> = (props) => <Arrow {...props} />;

const defaultData: Props = { color: "roiApyPositive" };

export const Default = Template.bind({});
Default.args = { ...defaultData };

export const ArrowDown = Template.bind({});
ArrowDown.args = { ...defaultData, direction: "down", color: "roiApyNegative" };
