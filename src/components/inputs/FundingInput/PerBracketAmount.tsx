import React from "react";
import styled from "styled-components";

import { Text, Loader } from "@gnosis.pm/safe-react-components";

import { TokenDetails } from "types";

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
  tokenDetails: TokenDetails | null;
}

export const PerBracketAmount = (props: Props): JSX.Element => {
  const { amount, tokenDetails } = props;

  return (
    <Wrapper>
      <Text size="sm" center strong color="shadow">
        per bracket
      </Text>
      {tokenDetails ? (
        <Text size="sm" center strong>
          {amount} {tokenDetails.symbol}
        </Text>
      ) : (
        <Loader size="sm" />
      )}
    </Wrapper>
  );
};
