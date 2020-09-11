import React from "react";
import Decimal from "decimal.js";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import { Text } from "@gnosis.pm/safe-react-components";

import { DeployPageViewer, Props } from "./viewer";

export default {
  component: DeployPageViewer,
  title: "pages/Deploy",
  excludeStories: /Data$/,
} as Meta;

export const deployPageData: Props = {
  onBaseTokenSelect: action("onBaseTokenSelect"),
  onQuoteTokenSelect: action("onQuoteTokenSelect"),
};

export const filledDeployPageData: Props = {
  ...deployPageData,
  baseTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  quoteTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

const Template = (args: Props): JSX.Element => {
  return <DeployPageViewer {...args} />;
};

export const Default = Template.bind({});
Default.args = { ...deployPageData };

export const WithError = Template.bind({});
WithError.args = {
  ...Default.args,
  ...filledDeployPageData,
  messages: [{ type: "error", label: "Insufficient DAI balance" }],
};
WithError.parameters = { useGetPrice: { price: new Decimal("380.39134") } };

export const WithWarning = Template.bind({});
WithWarning.args = {
  ...Default.args,
  ...filledDeployPageData,
  messages: [
    {
      type: "warning",
      label: "Detected: Start price >2% higher than market price",
      children: (
        <Text as="span" size="md" color="shadow">
          The specified{" "}
          <Text as="span" size="md" strong>
            Start Price
          </Text>{" "}
          is at least 2% higher than the current indicated market price. If
          intentional continue with your order.
        </Text>
      ),
    },
  ],
};

export const MultipleMessages = Template.bind({});
MultipleMessages.args = {
  ...WithWarning.args,
  messages: [...WithWarning.args.messages, ...WithError.args.messages],
};
