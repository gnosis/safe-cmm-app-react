import React, { memo } from "react";
import styled from "styled-components";

import { Text } from "@gnosis.pm/safe-react-components";

interface WrapperProps {
  inline?: boolean;
}

const Wrapper = styled.div<WrapperProps>`
  padding-top: 0.4em;
  display: flex;
  align-items: center;

  ${({ inline }: WrapperProps): string =>
    inline
      ? `
  &>p:first-of-type {
    padding-right: 0.5em;
  }`
      : `
  flex-direction: column;

  p:first-of-type {
    padding-bottom: 0.2em;
  }`}
`;

export interface Props extends WrapperProps {
  subtext: string;
  amount: string | React.ReactElement;
}

const _SubtextAmount = (props: Props): JSX.Element => {
  const { subtext, amount, inline } = props;

  return (
    <Wrapper inline={inline}>
      <Text size="md" center strong color="shadow">
        {subtext}
      </Text>
      <Text size="md" center strong>
        {amount}
      </Text>
    </Wrapper>
  );
};

export const SubtextAmount = memo(_SubtextAmount);
