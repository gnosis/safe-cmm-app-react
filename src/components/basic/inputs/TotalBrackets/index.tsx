import React from "react";
import styled from "styled-components";

import { DEFAULT_INPUT_WIDTH } from "utils/constants";

import {
  BracketsInput,
  Props as BracketsInputProps,
} from "components/basic/inputs/BracketsInput";
import { TextWithTooltip } from "components/basic/display/TextWithTooltip";
import { SubtextAmount } from "components/basic/display/SubtextAmount";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export interface Props extends Omit<BracketsInputProps, "customLabel"> {
  amount: string;
}

export const TotalBrackets = (props: Props): JSX.Element => {
  const { amount, ...rest } = props;

  return (
    <Wrapper>
      <BracketsInput
        {...rest}
        width={DEFAULT_INPUT_WIDTH}
        inputWidth="75px"
        center
        customLabel={
          <TextWithTooltip
            tooltip="Each bracket consists of a single Ethereum address that places a buy-low and a sell-high order. Every time the price goes through a bracket and activates both orders, the CMM provider earns the spread."
            size="lg"
          >
            Total Brackets
          </TextWithTooltip>
        }
      />
      <SubtextAmount subtext="Total investment:" amount={amount} />
    </Wrapper>
  );
};
