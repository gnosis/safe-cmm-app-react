import React, { createContext, memo, useMemo } from "react";
import styled from "styled-components";

import { Header } from "./Header";
import { Bar } from "./Bar";
import { Footer } from "./Footer";

const Wrapper = styled.div`
  height: 90px;
`;

type PageType = "deploy" | "strategy";

export type Props = {
  type: PageType;

  baseTokenAddress?: string;
  quoteTokenAddress?: string;

  totalBrackets?: number;
  leftBrackets?: number;
  rightBrackets?: number;

  lowestPrice?: string;
  startPrice?: string;
  highestPrice?: string;

  lowerThreshold?: number;
  upperThreshold?: number;
};

type ExtraContextProps = {
  needlePosition?: number;
};

export const BracketsViewContext = createContext<Props & ExtraContextProps>({
  type: "deploy",
});

/**
 * Calculates needle position as a percentage.
 * Percentage can be negative or greater than 100.
 * Returns undefined when input is invalid
 *
 * @param startPrice Start price string
 * @param lowestPrice Lowest Price string
 * @param highestPrice Highest Price string
 */
function calculateNeedlePosition(
  startPrice?: string,
  lowestPrice?: string,
  highestPrice?: string
): number | undefined {
  const sp = Number(startPrice);
  const lp = Number(lowestPrice);
  const hp = Number(highestPrice);

  if (isNaN(sp) || isNaN(lp) || isNaN(hp) || lp >= hp) {
    return undefined;
  }

  return (100 * (sp - lp)) / (hp - lp);
}

const LOWER_THRESHOLD = 20;
const UPPER_THRESHOLD = 80;

export const BracketsViewView = memo(function BracketsViewView(
  props: Props
): JSX.Element {
  const {
    totalBrackets = 1,
    leftBrackets = 0,
    rightBrackets = 0,

    startPrice,
    lowestPrice,
    highestPrice,

    lowerThreshold = LOWER_THRESHOLD,
    upperThreshold = UPPER_THRESHOLD,
  } = props;

  const needlePosition = useMemo(
    (): number | undefined =>
      calculateNeedlePosition(startPrice, lowestPrice, highestPrice),
    [highestPrice, lowestPrice, startPrice]
  );

  const context = useMemo(
    () => ({
      ...props,
      totalBrackets: totalBrackets >= 1 ? totalBrackets : 1,
      leftBrackets,
      rightBrackets,
      needlePosition,
      lowerThreshold,
      upperThreshold,
    }),
    [
      leftBrackets,
      lowerThreshold,
      needlePosition,
      props,
      rightBrackets,
      totalBrackets,
      upperThreshold,
    ]
  );

  return (
    <BracketsViewContext.Provider value={context}>
      <Wrapper>
        <Header />
        <Bar />
        <Footer />
      </Wrapper>
    </BracketsViewContext.Provider>
  );
});
