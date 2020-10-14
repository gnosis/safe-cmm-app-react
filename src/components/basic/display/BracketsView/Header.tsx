import React, { memo, useContext, useMemo } from "react";
import styled from "styled-components";

import { TokenDisplay } from "../TokenDisplay";

import { BracketsViewContext } from "./viewer";
import { NeedleLabel } from "./NeedleLabel";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  height: 16px;
  margin-bottom: 0.1em;

  & > * {
    width: 100%;
  }

  .justifyRight {
    text-align: right;
    justify-content: end;
  }
`;

const TokenAndLabel = styled.span`
  display: flex;

  & > :first-child {
    margin-right: 0.5em;
  }
`;

export const Header = memo(function Header(): JSX.Element {
  const {
    baseTokenAddress,
    quoteTokenAddress,
    needlePosition,
    lowerThreshold,
    upperThreshold,
  } = useContext(BracketsViewContext);

  const baseTokenDisplay = useMemo((): React.ReactNode => {
    return (
      baseTokenAddress && <TokenDisplay token={baseTokenAddress} size="sm" />
    );
  }, [baseTokenAddress]);

  const quoteTokenDisplay = useMemo((): React.ReactNode => {
    return (
      quoteTokenAddress && (
        <TokenDisplay
          token={quoteTokenAddress}
          size="sm"
          className="justifyRight"
        />
      )
    );
  }, [quoteTokenAddress]);

  const leftSide = useMemo((): React.ReactNode => {
    if (needlePosition < 0) {
      return <NeedleLabel adornment="left" />;
    } else if (needlePosition === 0) {
      return <NeedleLabel />;
    } else if (needlePosition < lowerThreshold) {
      return (
        <TokenAndLabel>
          {baseTokenDisplay}
          <NeedleLabel />
        </TokenAndLabel>
      );
    } else {
      return baseTokenDisplay;
    }
  }, [baseTokenDisplay, lowerThreshold, needlePosition]);

  const rightSide = useMemo((): React.ReactNode => {
    if (needlePosition > 100) {
      return <NeedleLabel adornment="right" className="justifyRight" />;
    } else if (needlePosition === 100) {
      return <NeedleLabel className="justifyRight" />;
    } else if (needlePosition >= upperThreshold) {
      return (
        <TokenAndLabel className="justifyRight">
          <NeedleLabel />
          {quoteTokenDisplay}
        </TokenAndLabel>
      );
    } else {
      return quoteTokenDisplay;
    }
  }, [needlePosition, quoteTokenDisplay, upperThreshold]);

  return (
    <Wrapper>
      {leftSide}
      {rightSide}
    </Wrapper>
  );
});
