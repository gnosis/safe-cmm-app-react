import React from "react";
import styled from "styled-components";

import { Text } from "@gnosis.pm/safe-react-components";

import { pxOrCustomCssUnits } from "utils/cssUtils";

import {
  TextFieldWithCustomLabel,
  Props as TextFieldWithCustomLabelProps,
} from "components/inputs/TextFieldWithCustomLabel";

import { PerBracketAmount } from "./PerBracketAmount";
import { Label } from "./Label";

const DEFAULT_INPUT_WIDTH = "120px";

const Wrapper = styled.div<{ width: string | number }>`
  width: ${({ width }) => pxOrCustomCssUnits(width)};
  display: flex;
  flex-direction: column;
`;

interface Props extends Omit<TextFieldWithCustomLabelProps, "customLabel"> {
  onMaxClick: (e: React.SyntheticEvent) => void;
  amountPerBracket: string;
  tokenDisplayName: string;
}

export const FundingInput = (props: Props): JSX.Element => {
  const {
    onMaxClick,
    amountPerBracket,
    tokenDisplayName,
    width = DEFAULT_INPUT_WIDTH,
    ...rest
  } = props;

  const tokenDisplay = (
    <Text size="md" strong>
      {tokenDisplayName}
    </Text>
  );

  return (
    <Wrapper width={width}>
      <TextFieldWithCustomLabel
        {...rest}
        customLabel={<Label onClick={onMaxClick} error={props.error} />}
        width={width}
        endAdornment={tokenDisplay}
      />
      <PerBracketAmount
        amount={amountPerBracket}
        tokenDisplayName={tokenDisplayName}
      />
    </Wrapper>
  );
};
