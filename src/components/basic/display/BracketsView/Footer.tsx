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
    justify-content: flex-end;
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
    quoteTokenAddress,
    startPrice,
    lowestPrice,
    highestPrice,
    needlePosition,
    lowerThreshold,
    upperThreshold,
    type,
  } = useContext(BracketsViewContext);

  const isDeploy = type === "deploy";

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
            token={quoteTokenAddress}
            adornment={adornment}
            color="primary"
            size="xs"
            isOutOfRange={isOutOfRange}
            className={className}
          />
        )
      );
    },
    [quoteTokenAddress, startPrice]
  );

  const lowestPriceDisplay = useMemo(() => {
    return (
      lowestPrice && (
        <PriceDisplay price={lowestPrice} token={quoteTokenAddress} size="xs" />
      )
    );
  }, [quoteTokenAddress, lowestPrice]);

  const highestPriceDisplay = useMemo(() => {
    return (
      highestPrice && (
        <PriceDisplay
          price={highestPrice}
          token={quoteTokenAddress}
          size="xs"
          className="justifyRight"
        />
      )
    );
  }, [quoteTokenAddress, highestPrice]);

  const leftSide = useMemo(() => {
    if (needlePosition < 0) {
      return startPriceDisplayFactory("left", true);
    } else if (needlePosition === 0) {
      return startPriceDisplayFactory();
    } else if (needlePosition < lowerThreshold) {
      if (isDeploy) {
        return (
          <TwoPrices>
            {lowestPriceDisplay}
            {startPriceDisplayFactory()}
          </TwoPrices>
        );
      } else {
        return startPriceDisplayFactory();
      }
    } else if (isDeploy) {
      return lowestPriceDisplay;
    } else {
      return "";
    }
  }, [
    isDeploy,
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
      if (isDeploy) {
        return (
          <TwoPrices className="justifyRight">
            {startPriceDisplayFactory(undefined, false, "justifyRight")}
            {highestPriceDisplay}
          </TwoPrices>
        );
      } else {
        return startPriceDisplayFactory(undefined, false, "justifyRight");
      }
    } else if (isDeploy) {
      return highestPriceDisplay;
    } else {
      return "";
    }
  }, [
    highestPriceDisplay,
    isDeploy,
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
