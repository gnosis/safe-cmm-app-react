import React from "react";
import styled from "styled-components";

import { Text } from "@gnosis.pm/safe-react-components";

import { useTokenDetails } from "hooks/useTokenDetails";

import { TokenDisplay } from "components/misc/TokenDisplay";

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
  tokenAddress: string;
}

export const PerBracketAmount = (props: Props): JSX.Element => {
  const { amount, tokenAddress } = props;

  const tokenDetails = useTokenDetails(tokenAddress);

  return (
    <Wrapper>
      <Text size="sm" center strong color="shadow">
        per bracket
      </Text>
      <Text size="sm" center strong>
        {amount} <TokenDisplay tokenDetails={tokenDetails} size="sm" />
      </Text>
    </Wrapper>
  );
};
