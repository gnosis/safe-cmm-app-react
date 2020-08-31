import React from "react";
import styled from "styled-components";

import { DEFAULT_INPUT_WIDTH } from "utils/constants";

import {
  BracketsInput,
  Props as BracketsInputProps,
} from "components/basic/inputs/BracketsInput";
import { LabelWithTooltip } from "components/basic/labels/LabelWithTooltip";
import { SubtextAmount } from "components/basic/misc/SubtextAmount";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export interface Props extends BracketsInputProps {
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
          <LabelWithTooltip
            text="Total Brackets"
            tooltip="TODO: add tooltips :)"
            size="lg"
          />
        }
      />
      <SubtextAmount subtext="Total investment:" amount={amount} />
    </Wrapper>
  );
};
