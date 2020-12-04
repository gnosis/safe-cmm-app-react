import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";

import { ONE_HUNDRED_DECIMAL } from "utils/constants";

import { PercentageIndicator } from "../StrategyTotalValue/PercentageIndicator";

import { DescriptionList, Props } from ".";

export default {
  component: DescriptionList,
  title: "basic/display/DescriptionList",
} as Meta;

const Template: Story<Props> = (props) => <DescriptionList {...props} />;

const defaultData: Props = {
  children: (
    <>
      <dt>Key</dt>
      <dd>Value</dd>
      <dt>
        <span>Component key</span>
      </dt>
      <dd>
        <span>Component value</span>
      </dd>
      <dt>Longer key with column:</dt>
      <dd>
        <PercentageIndicator value={ONE_HUNDRED_DECIMAL} />
      </dd>
      <dt>Loader:</dt>
      <dd>
        <PercentageIndicator isLoading />
      </dd>
    </>
  ),
};

export const Default = Template.bind({});
Default.args = { ...defaultData };

export const Large = Template.bind({});
Large.args = { ...defaultData, size: "lg" };
