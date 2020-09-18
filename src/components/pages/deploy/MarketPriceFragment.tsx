import React, { memo } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";

import { MarketPrice } from "components/basic/display/MarketPrice";

import { baseTokenAddressAtom, quoteTokenAddressAtom } from "./atoms";

const Wrapper = styled.div`
  align-self: center;
`;

function component(): JSX.Element {
  const baseTokenAddress = useRecoilValue(baseTokenAddressAtom);
  const quoteTokenAddress = useRecoilValue(quoteTokenAddressAtom);

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
