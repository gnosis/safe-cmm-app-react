import React, { useState } from "react";
import BN from "bn.js";
import Decimal from "decimal.js";
import { Meta } from "@storybook/react";

import { Text } from "@gnosis.pm/safe-react-components";

import { DeployPageViewer, Props } from "./viewer";
import { DeployPage } from ".";

export default {
  component: DeployPageViewer,
  title: "pages/Deploy",
  excludeStories: /Data$/,
  parameters: {
    useGetPrice: ({ baseToken, quoteToken }) => ({
      price: !baseToken || !quoteToken ? null : new Decimal("323.44"),
    }),
    useTokenBalance: (address?: string) => ({
      balance:
        address === "0x6B175474E89094C44Da98b954EedeAC495271d0F"
          ? new BN("9310293132123908088")
          : address === "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          ? new BN("579127394283794127491")
          : !!address
          ? new BN("0")
          : null,
    }),
  },
} as Meta;

// Viewer

export const deployPageData: Props = {};

export const filledDeployPageData: Props = {
  ...deployPageData,
  baseTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  quoteTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

const Template = (args: Props): JSX.Element => {
  const [baseTokenAddress, setBaseTokenAddress] = useState(
    args.baseTokenAddress
  );
  const [quoteTokenAddress, setQuoteTokenAddress] = useState(
    args.quoteTokenAddress
  );
  return (
    <DeployPageViewer
      {...args}
      baseTokenAddress={baseTokenAddress}
      quoteTokenAddress={quoteTokenAddress}
      onBaseTokenSelect={setBaseTokenAddress}
      onQuoteTokenSelect={setQuoteTokenAddress}
    />
  );
};

export const Default = Template.bind({});
Default.args = { ...deployPageData };

export const WithError = Template.bind({});
WithError.args = {
  ...Default.args,
  ...filledDeployPageData,
  messages: [{ type: "error", label: "Insufficient DAI balance" }],
};

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

// Container

const TemplateContainer = (): JSX.Element => <DeployPage />;

export const DefaultContainer = TemplateContainer.bind({});
