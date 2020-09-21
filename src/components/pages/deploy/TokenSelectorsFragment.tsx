import React, { memo, useContext } from "react";
import styled from "styled-components";

import { TokenSelector } from "components/basic/inputs/TokenSelector";
import { Icon } from "@gnosis.pm/safe-react-components";

import { DeployPageContext } from "./viewer";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  & > span > svg {
    transform: rotate(90deg);
  }
`;

function component(): JSX.Element {
  const {
    onBaseTokenSelect,
    onQuoteTokenSelect,
    baseTokenAddress,
    quoteTokenAddress,
  } = useContext(DeployPageContext);

  return (
    <Wrapper>
      <TokenSelector
        label="Pick Token A"
        tooltip="This is the token that will be used to buy token B"
        onSelect={onBaseTokenSelect}
        selectedTokenAddress={baseTokenAddress}
      />
      <Icon type="transactionsInactive" size="md" />
      <TokenSelector
        label="Pick Token B"
        tooltip="This is the token that will be sold for token A"
        onSelect={onQuoteTokenSelect}
        selectedTokenAddress={quoteTokenAddress}
      />
    </Wrapper>
  );
}

export const TokenSelectorsFragment = memo(component);
