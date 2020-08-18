import React, { useContext, useState, useEffect } from "react";
import styled from "styled-components";

import { Text, Loader } from "@gnosis.pm/safe-react-components";

import { TokenDetails } from "types";

import { Web3Context } from "components/Web3Provider";

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

export interface Props
  extends Omit<TextFieldWithCustomLabelProps, "customLabel"> {
  onMaxClick: (e: React.SyntheticEvent) => void;
  amountPerBracket: string;
  tokenAddress: string;
}

export const FundingInput = (props: Props): JSX.Element => {
  const {
    onMaxClick,
    amountPerBracket,
    tokenAddress,
    width = DEFAULT_INPUT_WIDTH,
    ...rest
  } = props;

  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);

  const { getErc20Details } = useContext(Web3Context);

  useEffect(() => {
    getErc20Details(tokenAddress).then(setTokenDetails);
  }, [tokenAddress]);

  const tokenDisplay = tokenDetails ? (
    <Text size="md" strong>
      {tokenDetails.symbol}
    </Text>
  ) : (
    <Loader size="md" />
  );

  return (
    <Wrapper width={width}>
      <TextFieldWithCustomLabel
        {...rest}
        customLabel={<Label onClick={onMaxClick} error={props.error} />}
        width={width}
        endAdornment={tokenDisplay}
      />
      <PerBracketAmount amount={amountPerBracket} tokenDetails={tokenDetails} />
    </Wrapper>
  );
};
