import React from "react";
import { Meta } from "@storybook/react";

import { Text } from "components/basic/display/Text";

import { Message, Props } from ".";

export default {
  component: Message,
  title: "basic/display/Message",
  excludeStories: /Data$/,
} as Meta;

export const messageData = {
  type: "error",
  label: "This is an error",
} as Props;

const Template = (args: Props): JSX.Element => <Message {...args} />;

export const Default = Template.bind({});
Default.args = { ...messageData };

export const Warning = Template.bind({});
Warning.args = { ...Default.args, type: "warning", label: "This is a warning" };

export const WithTextChildren = Template.bind({});
WithTextChildren.args = {
  ...Default.args,
  children:
    "The specified Start Price is at least 2% higher than the current indicated market price. " +
    "If intentional continue with your order.",
};

export const WithComponentChildren = Template.bind({});
WithComponentChildren.args = {
  ...Default.args,
  children: (
    <Text color="shadow">
      The specified{" "}
      <Text strong as="span">
        Start Price
      </Text>{" "}
      is at least 2% higher than the current indicated market price. If
      intentional continue with your order.
    </Text>
  ),
};
