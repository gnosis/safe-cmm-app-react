import React from "react";
import { Meta } from "@storybook/react/types-6-0";

import { Tooltip, Props } from ".";

export default {
  component: Tooltip,
  title: "basic/display/Tooltip",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
} as Meta;

const Template = (args: Props): JSX.Element => (
  <div>
    This text has a tooltip{" "}
    <Tooltip {...args}>
      <span style={{ borderBottom: "1px dashed black" }}>here</span>
    </Tooltip>
  </div>
);

export const tooltipData = { title: "I am a tooltip!" };

export const Default = Template.bind({});
Default.args = { ...tooltipData };

export const MultiLineTooltip = Template.bind({});
MultiLineTooltip.args = {
  ...tooltipData,
  title:
    "Each bracket consists of a single Ethereum address that places a " +
    "buy-low and a sell-high order. Everytime the price goes through a " +
    "bracket and activates both orders, the CMM provider earns the spread",
};

export const Interactive = Template.bind({});
Interactive.args = {
  ...tooltipData,
  interactive: true,
  title: (
    <span>
      Contains a <a href="#">link</a>
    </span>
  ),
};
