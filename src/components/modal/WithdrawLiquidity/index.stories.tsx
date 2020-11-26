import React from "react";
import { Meta } from "@storybook/react";

import { Footer, Body } from "./";
import { StrategyState } from "types";
import { GenericModal } from "@gnosis.pm/safe-react-components";
import { noop } from "lodash";

// TODO: refactor, removing unused states
// const defaultStates = [
//   [baseTokenAddressAtom, "0x6B175474E89094C44Da98b954EedeAC495271d0F"],
//   [quoteTokenAddressAtom, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
//   [lowestPriceAtom, "300"],
//   [startPriceAtom, "323"],
//   [highestPriceAtom, "350"],
//   [baseTokenAmountAtom, "1000"],
//   [quoteTokenAmountAtom, "1000"],
//   [totalBracketsAtom, "10"],
// ];

export default {
  component: Body,
  title: "modals/WithdrawLiquiduity",
  excludeStories: /Data$/,
} as Meta;

// Viewer

const Template = (args: any): JSX.Element => {
  const strategy = {
    transactionHash: "0x123",
  } as StrategyState;

  return (
    <GenericModal
      title="Withdraw All Liquidity"
      body={<Body {...args} strategy={strategy} setConfirmHandler={noop} />}
      footer={
        <Footer
          {...args}
          strategy={strategy}
          triggerConfirm={noop}
          triggerReject={noop}
        />
      }
      onClose={noop}
    />
  );
};

export const Default = Template.bind({});
