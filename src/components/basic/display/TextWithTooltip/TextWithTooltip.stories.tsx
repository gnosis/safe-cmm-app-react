import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { TextWithTooltip, Props } from ".";

export default {
  component: TextWithTooltip,
  title: "basic/display/TextWithTooltip",
  excludeStories: /.*Data$/,
} as Meta;

export const textWithTooltipData = {
  text: "Label label",
  tooltip: "This is a nice tooltip",
  size: "lg",
} as Props;

const Template = (args: Props): JSX.Element => <TextWithTooltip {...args} />;

export const Default = Template.bind({});
Default.args = { ...textWithTooltipData };

export const Small = Template.bind({});
Small.args = { ...Default.args, size: "sm" };

export const Error = Template.bind({});
Error.args = { ...Default.args, color: "error" };

export const Warning = Template.bind({});
Warning.args = { ...Default.args, color: "warning" };

export const Deactivated = Template.bind({});
Deactivated.args = { ...Default.args, color: "shadow" };
