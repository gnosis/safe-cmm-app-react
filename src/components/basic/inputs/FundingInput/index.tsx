import React from "react";
import styled from "styled-components";

import { pxOrCustomCssUnits } from "utils/cssUtils";
import { DEFAULT_INPUT_WIDTH } from "utils/constants";

import { NumberInput, Props as NumberInputPros } from "../NumberInput";

import { PerBracketAmount } from "./PerBracketAmount";
import { Label } from "./Label";

const Wrapper = styled.div<{ width: string | number }>`
  width: ${({ width }) => pxOrCustomCssUnits(width)};
  display: flex;
  flex-direction: column;
`;

export interface Props extends Omit<NumberInputPros, "customLabel"> {
  onMaxClick: (e: React.SyntheticEvent) => void;
  brackets?: number;
  tokenAddress: string;
}

export const FundingInput = (props: Props): JSX.Element => {
  const {
    onMaxClick,
    error,
    brackets,
    tokenAddress,
    value,
    width = DEFAULT_INPUT_WIDTH,
    ...rest
  } = props;

  return (
    <Wrapper width={width}>
      <NumberInput
        {...rest}
        error={error}
        value={value}
        customLabel={<Label onClick={onMaxClick} error={error} />}
        width={width}
        tokenAddress={tokenAddress}
      />
      <PerBracketAmount
        totalAmount={value}
        tokenAddress={tokenAddress}
        brackets={brackets}
      />
    </Wrapper>
  );
};
