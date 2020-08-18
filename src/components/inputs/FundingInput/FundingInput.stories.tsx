import React, { useState, useCallback } from "react";
import { action } from "@storybook/addon-actions";

import Web3Provider, { Web3Context } from "components/Web3Provider";
import getLoggerOrCreate from "utils/logger";
import { TokenDetails } from "types";

const logger = getLoggerOrCreate("FundingInput.stories");

logger.log(`story context`, Web3Provider);

import { FundingInput, TokenDetails } from ".";

const context = {
  getErc20Details: async (address: string): Promise<TokenDetails> => {
    return {
      decimals: 18,
      name: "Token",
      symbol: "TKN",
      address,
    };
  },
};

const Story = ({ storyFn }) => storyFn();

export default {
  component: FundingInput,
  title: "FundingInput",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
  decorators: [
    (storyFn) => (
      <Web3Context.Provider value={context}>
        <Story storyFn={storyFn} />
      </Web3Context.Provider>
    ),
  ],
};

const onSubmit = (e: React.FormEvent) => e.preventDefault();

export const fundingInputData = {
  id: "fundingId",
  amountPerBracket: "5",
  tokenAddress: "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b",
};

export const actionData = {
  onMaxClick: action("onMaxClick"),
};

export const Default = () => {
  const [value, setValue] = useState("");

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <FundingInput
        {...fundingInputData}
        {...actionData}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const VeryLongValue = () => {
  const [value, setValue] = useState("54894321689901283.3337");

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <FundingInput
        {...fundingInputData}
        amountPerBracket="91028309701253.5123"
        {...actionData}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const ErrorInput = () => {
  const [value, setValue] = useState("sdf");

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <FundingInput
        {...fundingInputData}
        {...actionData}
        value={value}
        error
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const WarningInput = () => {
  const [value, setValue] = useState("sdf");

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <FundingInput
        {...fundingInputData}
        {...actionData}
        value={value}
        warn
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};

export const SetMaxTo100 = () => {
  const [value, setValue] = useState("");
  const onMaxClick = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>) => {
      setValue("100");
    },
    [setValue]
  );

  return (
    <form noValidate autoComplete="off" onSubmit={onSubmit}>
      <FundingInput
        {...fundingInputData}
        {...actionData}
        onMaxClick={onMaxClick}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
};
