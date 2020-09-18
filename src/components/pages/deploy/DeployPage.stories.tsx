import React from "react";
import BN from "bn.js";
import Decimal from "decimal.js";
import { Meta } from "@storybook/react";

import {
  Params as UseDeployStrategyParams,
  Return as UseDeployStrategyReturn,
} from "hooks/useDeployStrategy";

import { DeployPageViewer, Props } from "./viewer";
import { DeployPage } from ".";
import {
  baseTokenAddressAtom,
  baseTokenAmountAtom,
  errorAtom,
  highestPriceAtom,
  isSubmittingAtom,
  lowestPriceAtom,
  quoteTokenAddressAtom,
  quoteTokenAmountAtom,
  startPriceAtom,
  totalBracketsAtom,
} from "./atoms";

const defaultStates = [
  [baseTokenAddressAtom, "0x6B175474E89094C44Da98b954EedeAC495271d0F"],
  [quoteTokenAddressAtom, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
  [lowestPriceAtom, "300"],
  [startPriceAtom, "323"],
  [highestPriceAtom, "350"],
  [baseTokenAmountAtom, "1000"],
  [quoteTokenAmountAtom, "1000"],
  [totalBracketsAtom, "10"],
];

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
    recoilStates: defaultStates,
  },
} as Meta;

// Viewer

const Template = (args: Props): JSX.Element => {
  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => event.preventDefault();

  return <DeployPageViewer {...args} onSubmit={onSubmit} />;
};

export const Default = Template.bind({});

export const Submitting = Template.bind({});
Submitting.parameters = {
  recoilStates: [...defaultStates, [isSubmittingAtom, "true"]],
};

export const WithError = Template.bind({});
WithError.parameters = {
  recoilStates: [
    ...defaultStates,
    [errorAtom, { label: "Insufficient DAI balance" }],
  ],
};

// Container

const TemplateContainer = (): JSX.Element => <DeployPage />;

export const DefaultContainer = TemplateContainer.bind({});
DefaultContainer.parameters = {
  useDeployStrategy: (
    params: UseDeployStrategyParams
  ): UseDeployStrategyReturn => {
    return async (): Promise<void> => {};
  },
};

export const ErrorOnDeployContainer = TemplateContainer.bind({});
ErrorOnDeployContainer.parameters = {
  useDeployStrategy: () => async () => {
    throw new Error("This will always fail. Sorry ¯\\_(ツ)_/¯");
  },
};
