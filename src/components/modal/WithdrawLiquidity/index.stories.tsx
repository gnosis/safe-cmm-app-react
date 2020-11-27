import React from "react";
import { Meta } from "@storybook/react";

import { Footer, Body } from "./";
import { StrategyState } from "types";
import { GenericModal } from "@gnosis.pm/safe-react-components";
import { noop } from "lodash";

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
