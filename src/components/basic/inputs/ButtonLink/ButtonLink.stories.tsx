import React from "react";

import { ButtonLink, Props } from ".";
import { action } from "@storybook/addon-actions";

export default {
  component: ButtonLink,
  title: "basic/input/ButtonLink",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
};

const onSubmit = (e: React.FormEvent) => e.preventDefault();

export const buttonLinkData = {
  type: "button",
  color: "primary",
  textSize: "lg",
  children: "button",
};

export const actionData = { onClick: action("onClick") };

const Template = (args: Props): JSX.Element => {
  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <ButtonLink {...args} />
    </form>
  );
};

export const Default = Template.bind({});
Default.args = { ...buttonLinkData, ...actionData };

export const TextIsANumber = Template.bind({});
TextIsANumber.args = { ...Default.args, children: "56446.44" };
