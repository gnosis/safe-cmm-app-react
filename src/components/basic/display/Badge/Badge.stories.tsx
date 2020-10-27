import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { Badge, Props } from ".";

export default {
  component: Badge,
  title: "basic/display/Badge",
  excludeStories: /.*Data$/,
} as Meta;

const badgeWithCount = {
  children: "5",
} as Props;

const Template = (args: Props): JSX.Element => <Badge {...args} />;

export const Default = Template.bind({});
Default.args = { ...badgeWithCount };

export const WithDot = Template.bind({});
WithDot.args = { ...badgeWithCount, hasDot: true };
