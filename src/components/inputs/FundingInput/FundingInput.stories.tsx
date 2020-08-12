import React, { useState, useCallback } from "react";
import { action } from "@storybook/addon-actions";

import { FundingInput } from ".";

export default {
  component: FundingInput,
  title: "FundingInput",
  // Our exports that end in "Data" are not stories.
  excludeStories: /.*Data$/,
};

const onSubmit = (e: React.FormEvent) => e.preventDefault();

export const fundingInputData = {
  id: "fundingId",
  amountPerBracket: "5",
  tokenDisplayName: "ETH",
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

export const InvalidInput = () => {
  const [value, setValue] = useState("sdf");

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
