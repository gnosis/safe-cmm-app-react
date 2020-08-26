import React from "react";
import styled from "styled-components";

import { Text } from "@gnosis.pm/safe-react-components";

interface WrapperProps {
  inline?: boolean;
}

const Wrapper = styled.div<WrapperProps>`
  padding-top: 0.4em;

  ${({ inline }: WrapperProps): string =>
    inline
      ? `
  p:first-of-type {
    padding-right: 0.5em;
  }`
      : `
  display: flex;
  flex-direction: column;

  p:first-of-type {
    padding-bottom: 0.2em;
  }`}
`;

export interface Props extends WrapperProps {
  subtext: string;
  amount: string | React.ReactElement;
}

export const SubtextAmount = (props: Props): JSX.Element => {
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
