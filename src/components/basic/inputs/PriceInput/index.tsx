import React from "react";

import { ThemeTextSize } from "@gnosis.pm/safe-react-components/dist/theme";

import { DEFAULT_INPUT_WIDTH } from "utils/constants";

import { LabelWithTooltip } from "components/basic/labels/LabelWithTooltip";

import { NumberInput, Props as NumberInputProps } from "../NumberInput";

export interface Props extends Omit<NumberInputProps, "customLabel"> {
  tokenAddress: string;
  labelText: string;
  labelTooltip: string;
  labelSize?: ThemeTextSize;
}

export const PriceInput = (props: Props): JSX.Element => {
  const {
    tokenAddress,
    error,
    labelText,
    labelTooltip,
    labelSize = "lg",
    width = DEFAULT_INPUT_WIDTH,
    ...rest
  } = props;

  return (
    <NumberInput
      {...rest}
      width={width}
      error={error}
      tokenAddress={tokenAddress}
      center
      customLabel={
        <LabelWithTooltip
          size={labelSize}
          text={labelText}
          tooltip={labelTooltip}
          color={error ? "error" : null}
        />
      }
    />
  );
};
