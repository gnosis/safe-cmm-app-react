import React, { memo } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";
import styled from "styled-components";

import { MarketPrice } from "components/basic/display/MarketPrice";

import {
  baseTokenAddressAtom,
  quoteTokenAddressAtom,
  startPriceAtom,
} from "./atoms";

const Wrapper = styled.div`
  align-self: center;
`;

function component(): JSX.Element {
  const baseTokenAddress = useRecoilValue(baseTokenAddressAtom);
  const quoteTokenAddress = useRecoilValue(quoteTokenAddressAtom);

  const onPriceClick = useRecoilCallback(
    ({ set }) => async (price: string): Promise<void> => {
      set(startPriceAtom, price);
    },
    []
  );

  return (
    <Wrapper>
      <MarketPrice
        baseTokenAddress={baseTokenAddress}
        quoteTokenAddress={quoteTokenAddress}
        onPriceClick={onPriceClick}
      />
    </Wrapper>
  );
}

export const MarketPriceFragment = memo(component);
