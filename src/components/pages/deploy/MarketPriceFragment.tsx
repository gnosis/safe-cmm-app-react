import React, { useContext, memo } from "react";
import styled from "styled-components";

import { MarketPrice } from "components/basic/display/MarketPrice";

import { DeployPageContext } from "./viewer";

const Wrapper = styled.div`
  align-self: center;
`;

function component(): JSX.Element {
  const { baseTokenAddress, quoteTokenAddress } = useContext(DeployPageContext);
  return (
    <Wrapper>
      <MarketPrice
        baseTokenAddress={baseTokenAddress}
        quoteTokenAddress={quoteTokenAddress}
      />
    </Wrapper>
  );
}

export const MarketPriceFragment = memo(component);
