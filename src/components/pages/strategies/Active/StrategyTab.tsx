import React, { memo, useMemo } from "react";
import styled from "styled-components";
import Decimal from "decimal.js";

import { formatAmountFull } from "@gnosis.pm/dex-js";

import { useGetPrice } from "hooks/useGetPrice";

import { ZERO_DECIMAL } from "utils/constants";
import { calculateBracketsFromMarketPrice } from "utils/calculateBrackets";

import { StrategyState } from "types";

import { BracketsViewer } from "components/basic/display/BracketsView";
import {
  BracketRowData,
  BracketsTable,
} from "components/basic/display/BracketsTable";
import { StrategyTotalValue } from "components/basic/display/StrategyTotalValue";

export type Props = {
  strategy: StrategyState;
};

const Wrapper = styled.div``;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: baseline;
`;

// TODO: move to constants
const TEN_DECIMAL = new Decimal("10");

// TODO: move to utils
function calculatePriceFromPartial(
  price: Decimal,
  denominatorDecimals: number,
  numeratorDecimals: number
): Decimal {
  return price.mul(TEN_DECIMAL.pow(denominatorDecimals - numeratorDecimals));
}

function formatBrackets(strategy: StrategyState): BracketRowData[] {
  // Edge case when strategy was not properly deployed
  // Most likely the first strategies deployed during development
  if (!strategy.baseToken || !strategy.quoteToken) {
    return [];
  }

  const {
    baseToken: { decimals: baseTokenDecimals },
    quoteToken: { decimals: quoteTokenDecimals },
    brackets,
    prices,
  } = strategy;

  return brackets.map((bracket, index) => ({
    // TODO: maybe formatting no longer needed?
    lowPrice: calculatePriceFromPartial(
      prices[index * 2],
      baseTokenDecimals,
      quoteTokenDecimals
    ),
    highPrice: calculatePriceFromPartial(
      prices[index * 2 + 1],
      baseTokenDecimals,
      quoteTokenDecimals
    ),
    balanceBase: bracket.balanceBase || ZERO_DECIMAL,
    balanceQuote: bracket.balanceQuote || ZERO_DECIMAL,
  }));
}

export const StrategyTab = memo(function StrategyTab(
  props: Props
): JSX.Element {
  const { strategy } = props;
  const { baseToken, quoteToken, brackets, priceRange } = strategy;

  const { price } = useGetPrice({
    source: "GnosisProtocol",
    baseToken,
    quoteToken,
  });

  const { baseTokenBrackets, quoteTokenBrackets } = useMemo(
    () =>
      calculateBracketsFromMarketPrice({
        marketPrice: price || ZERO_DECIMAL,
        totalBrackets: brackets.length,
        lowestPrice: priceRange?.lower || ZERO_DECIMAL,
        highestPrice: priceRange?.upper || ZERO_DECIMAL,
      }),
    [brackets.length, price, priceRange?.lower, priceRange?.upper]
  );

  const { leftBrackets, rightBrackets } = useMemo(() => {
    const tableBrackets = formatBrackets(strategy);

    const leftBrackets = tableBrackets.slice(0, baseTokenBrackets);
    const rightBrackets = tableBrackets.slice(baseTokenBrackets);

    return { leftBrackets, rightBrackets };
  }, [baseTokenBrackets, strategy]);

  return (
    <Wrapper>
      <BracketsViewer
        type="strategy"
        baseTokenAddress={baseToken.address}
        quoteTokenAddress={quoteToken.address}
        lowestPrice={priceRange?.lower.toString()}
        highestPrice={priceRange?.upper.toString()}
        totalBrackets={brackets?.length}
        leftBrackets={baseTokenBrackets}
        rightBrackets={quoteTokenBrackets}
        startPrice={price?.isFinite() ? price.toString() : "N/A"}
      />
      <Grid>
        <BracketsTable
          baseTokenAddress={baseToken.address}
          quoteTokenAddress={quoteToken.address}
          type="left"
          brackets={leftBrackets}
        />
        <StrategyTotalValue strategy={strategy} />
        <BracketsTable
          baseTokenAddress={baseToken.address}
          quoteTokenAddress={quoteToken.address}
          type="right"
          brackets={rightBrackets}
        />
      </Grid>
    </Wrapper>
  );
});
