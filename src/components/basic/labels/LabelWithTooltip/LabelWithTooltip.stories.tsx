import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { LabelWithTooltip, Props } from ".";

export default {
  component: LabelWithTooltip,
  title: "LabelWithTooltip",
  excludeStories: /.*Data$/,
} as Meta;

export const labelWithTooltipData = {
  text: "Label label",
  tooltip: "This is a nice tooltip",
  size: "lg",
} as Props;

const Template = (args: Props): JSX.Element => <LabelWithTooltip {...args} />;

export const Default = Template.bind({});
Default.args = { ...labelWithTooltipData };

export const Small = Template.bind({});
Small.args = { ...Default.args, size: "sm" };

export const Error = Template.bind({});
Error.args = { ...Default.args, color: "error" };

export const Warning = Template.bind({});
Warning.args = { ...Default.args, color: "warning" };

export const Deactivated = Template.bind({});
Deactivated.args = { ...Default.args, color: "shadow" };
