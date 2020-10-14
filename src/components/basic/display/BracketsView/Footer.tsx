import React, { memo, useCallback, useContext, useMemo } from "react";
import styled from "styled-components";

import { BracketsViewContext } from "./viewer";
import { PriceDisplay } from "./PriceDisplay";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  height: 14px;
  margin-top: 0.4em;

  & > * {
    width: 100%;
  }

  .justifyRight {
    justify-content: right;
  }
`;

const TwoPrices = styled.span`
  display: flex;

  & > :first-child {
    margin-right: 0.5em;
  }
`;

export const Footer = memo(function Footer(): JSX.Element {
  const {
    baseTokenAddress,
    startPrice,
    lowestPrice,
    highestPrice,
    needlePosition,
    lowerThreshold,
    upperThreshold,
  } = useContext(BracketsViewContext);

  const startPriceDisplayFactory = useCallback(
    (
      adornment?: "left" | "right",
      isOutOfRange?: boolean,
      className?: string
    ) => {
      return (
        startPrice && (
          <PriceDisplay
            price={startPrice}
            token={baseTokenAddress}
            adornment={adornment}
            color="primary"
            size="xs"
            isOutOfRange={isOutOfRange}
            className={className}
          />
        )
      );
    },
    [baseTokenAddress, startPrice]
  );

  const lowestPriceDisplay = useMemo(() => {
    return (
      lowestPrice && (
        <PriceDisplay price={lowestPrice} token={baseTokenAddress} size="xs" />
      )
    );
  }, [baseTokenAddress, lowestPrice]);

  const highestPriceDisplay = useMemo(() => {
    return (
      highestPrice && (
        <PriceDisplay
          price={highestPrice}
          token={baseTokenAddress}
          size="xs"
          className="justifyRight"
        />
      )
    );
  }, [baseTokenAddress, highestPrice]);

  const leftSide = useMemo(() => {
    if (needlePosition < 0) {
      return startPriceDisplayFactory("left", true);
    } else if (needlePosition === 0) {
      return startPriceDisplayFactory();
    } else if (needlePosition < lowerThreshold) {
      return (
        <TwoPrices>
          {lowestPriceDisplay}
          {startPriceDisplayFactory()}
        </TwoPrices>
      );
    } else {
      return lowestPriceDisplay;
    }
  }, [
    lowerThreshold,
    lowestPriceDisplay,
    needlePosition,
    startPriceDisplayFactory,
  ]);

  const rightSide = useMemo(() => {
    if (needlePosition > 100) {
      return startPriceDisplayFactory("right", true, "justifyRight");
    } else if (needlePosition === 100) {
      return startPriceDisplayFactory(undefined, false, "justifyRight");
    } else if (needlePosition >= upperThreshold) {
      return (
        <TwoPrices className="justifyRight">
          {startPriceDisplayFactory(undefined, false, "justifyRight")}
          {highestPriceDisplay}
        </TwoPrices>
      );
    } else {
      return highestPriceDisplay;
    }
  }, [
    highestPriceDisplay,
    needlePosition,
    startPriceDisplayFactory,
    upperThreshold,
  ]);

  return (
    <Wrapper>
      {leftSide}
      {rightSide}
    </Wrapper>
  );
});
