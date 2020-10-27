import React from "react";

import { action } from "@storybook/addon-actions";

import { Link, Props } from ".";

export default {
  component: Link,
  title: "basic/input/Link",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
};

export const linkData = {
  type: "button",
  color: "primary",
  textSize: "lg",
  children: "link",
  href: "http://going.somewhere",
} as Props;

export const actionData = { onClick: action("onClick") };

const Template = (args: Props): JSX.Element => <Link {...args} />;

export const Default = Template.bind({});
Default.args = { ...linkData, ...actionData };

export const TextIsANumber = Template.bind({});
TextIsANumber.args = { ...Default.args, children: "56446.44" };
