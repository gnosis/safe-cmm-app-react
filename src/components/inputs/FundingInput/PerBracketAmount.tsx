import React from "react";
import styled from "styled-components";

import { Text } from "@gnosis.pm/safe-react-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding-top: 0.4em;

  p:first-of-type {
    padding-bottom: 0.2em;
  }
`;

export interface Props {
  amount: string;
  tokenDisplayName: string;
}

export const PerBracketAmount = (props: Props): JSX.Element => {
  const { amount, tokenDisplayName } = props;

  return (
    <Wrapper>
      <Text size="sm" center strong color="shadow">
        per bracket
      </Text>
      <Text size="sm" center strong>
        {amount} {tokenDisplayName}
      </Text>
    </Wrapper>
  );
};
