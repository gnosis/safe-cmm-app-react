import React, { memo, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import Decimal from "decimal.js";

import { useGetPrice } from "hooks/useGetPrice";

import { ZERO_DECIMAL, TEN_DECIMAL } from "utils/constants";
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
  const { baseToken, quoteToken } = strategy;

  const { price } = useGetPrice({
    source: "GnosisProtocol",
    baseToken,
    quoteToken,
  });

  // Split component in 2 to avoid re-fetching the price when hovering over brackets
  return <StrategyTabView price={price} {...props} />;
});

const StrategyTabView = memo(function StrategyTabView(
  props: Props & { price?: Decimal | null }
): JSX.Element {
  const [hoverBracketId, setHoverBracketId] = useState<number | undefined>(
    undefined
  );

  const { strategy, price } = props;
  const { baseToken, quoteToken, brackets, priceRange } = strategy;

  const {
    baseTokenBrackets,
    quoteTokenBrackets,
    bracketsSizes = [100],
  } = useMemo(
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

  const rightBracketsOnHover = useCallback(
    (bracketId?: number) =>
      setHoverBracketId(
        bracketId !== undefined && bracketId + leftBrackets.length
      ),
    [leftBrackets.length]
  );

  return (
    <Wrapper>
      <BracketsViewer
        type="strategy"
        baseTokenAddress={baseToken.address}
        quoteTokenAddress={quoteToken.address}
        lowestPrice={priceRange?.lower.toString()}
        highestPrice={priceRange?.upper.toString()}
        bracketsSizes={[100]}
        leftBrackets={baseTokenBrackets}
        rightBrackets={quoteTokenBrackets}
        startPrice={price?.isFinite() ? price.toString() : "N/A"}
        hoverId={hoverBracketId}
        onHover={setHoverBracketId}
      />
      <Grid>
        <BracketsTable
          baseTokenAddress={baseToken.address}
          quoteTokenAddress={quoteToken.address}
          type="left"
          brackets={leftBrackets}
          hoverId={hoverBracketId}
          onHover={setHoverBracketId}
        />
        <StrategyTotalValue strategy={strategy} />
        <BracketsTable
          baseTokenAddress={baseToken.address}
          quoteTokenAddress={quoteToken.address}
          type="right"
          brackets={rightBrackets}
          hoverId={
            hoverBracketId !== undefined && hoverBracketId - leftBrackets.length
          }
          onHover={rightBracketsOnHover}
        />
      </Grid>
    </Wrapper>
  );
});
