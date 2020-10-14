import React, { memo, useContext } from "react";
import styled from "styled-components";

import { NeedleLabel } from "./NeedleLabel";
import { PriceDisplay } from "./PriceDisplay";
import { BracketsViewContext } from "./viewer";

// TODO: move to const?
const NEEDLE_BORDER = "1px dashed #008C73";

const Wrapper = styled.div<{ needlePosition: number }>`
  height: inherit;
  width: 0;

  border: ${NEEDLE_BORDER};
  border-top: 0;
  border-bottom: 0;

  position: absolute;
  left: ${({ needlePosition }) => needlePosition}%;

  display: flex;
  flex-direction: column;
  align-items: center;

  .price {
    position: absolute;
    width: max-content;
    bottom: -20px;
  }
`;

export const Needle = memo(function Needle(): JSX.Element {
  const { needlePosition = 50, startPrice, baseTokenAddress } = useContext(
    BracketsViewContext
  );

  if (needlePosition < 0 || needlePosition >= 100) {
    return null;
  }

  return (
    <Wrapper needlePosition={needlePosition}>
      {needlePosition >= 20 && needlePosition <= 80 && (
        <>
          <NeedleLabel onNeedle />
          {startPrice && (
            <PriceDisplay
              price={startPrice}
              token={baseTokenAddress}
              color="primary"
              className="price"
            />
          )}
        </>
      )}
    </Wrapper>
  );
});
