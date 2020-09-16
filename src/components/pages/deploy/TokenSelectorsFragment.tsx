import React, { memo, useContext } from "react";
import styled from "styled-components";

import { TokenSelector } from "components/basic/inputs/TokenSelector";
import { Button, Icon } from "@gnosis.pm/safe-react-components";

import { DeployPageContext } from "./viewer";
import { Link } from "components/basic/inputs/Link";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .swapIcon {
    transform: rotate(90deg);
  }
`;

function component(): JSX.Element {
  const {
    swapTokens,
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
      <Link onClick={swapTokens} textSize="sm" color="text">
        <Icon type="transactionsInactive" size="md" className="swapIcon" />
      </Link>
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
