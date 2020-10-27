import React, { createContext, memo, useMemo } from "react";
import styled from "styled-components";

import {
  DEPLOY_LOWER_THRESHOLD,
  DEPLOY_UPPER_THRESHOLD,
  STRATEGY_LOWER_THRESHOLD,
  STRATEGY_UPPER_THRESHOLD,
} from "utils/constants";

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
};

type ExtraContextProps = {
  needlePosition?: number;

  lowerThreshold?: number;
  upperThreshold?: number;
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

    type,
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
      lowerThreshold:
        type === "deploy" ? DEPLOY_LOWER_THRESHOLD : STRATEGY_LOWER_THRESHOLD,
      upperThreshold:
        type === "deploy" ? DEPLOY_UPPER_THRESHOLD : STRATEGY_UPPER_THRESHOLD,
    }),
    [leftBrackets, needlePosition, props, rightBrackets, totalBrackets, type]
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
