import React from "react";
import styled from "styled-components";

import { pxOrCustomCssUnits } from "utils/cssUtils";
import { DEFAULT_INPUT_WIDTH } from "utils/constants";

import { NumberInput, Props as NumberInputPros } from "../NumberInput";

import { PerBracketAmount } from "./PerBracketAmount";
import { Label } from "./Label";

interface WrapperProps {
  width: string | number;
  disabled?: boolean;
}

const Wrapper = styled.div<WrapperProps>`
  width: ${({ width }) => pxOrCustomCssUnits(width)};
  display: flex;
  flex-direction: column;

  ${({ disabled }) => (disabled ? `opacity: 0.5;` : "")}
`;

export interface Props extends Omit<NumberInputPros, "customLabel"> {
  onMaxClick?: (e: React.SyntheticEvent) => void;
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

  const disabled = !brackets;

  return (
    <Wrapper width={width} disabled={disabled}>
      <NumberInput
        {...rest}
        readOnly={disabled}
        disabled={disabled}
        error={error}
        value={value}
        customLabel={
          <Label onClick={onMaxClick} error={error} disabled={disabled} />
        }
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
