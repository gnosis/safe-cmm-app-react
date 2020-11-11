import React, { memo, useMemo } from "react";
import styled from "styled-components";
import Decimal from "decimal.js";

import { formatAmountFull } from "@gnosis.pm/dex-js";

import { useGetPrice } from "hooks/useGetPrice";

import { ZERO_DECIMAL } from "utils/constants";
import { calculateBracketsFromMarketPrice } from "utils/calculateBrackets";

import Strategy from "logic/strategy";

import { BracketsViewer } from "components/basic/display/BracketsView";
import {
  BracketRowData,
  BracketsTable,
} from "components/basic/display/BracketsTable";
import { StrategyTotalValue } from "components/basic/display/StrategyTotalValue";

export type Props = {
  strategy: Strategy;
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

function formatBrackets(strategy: Strategy): BracketRowData[] {
  // Edge case when strategy was not properly deployed
  // Most likely the first strategies deployed during development
  if (!strategy.baseTokenDetails || !strategy.quoteTokenDetails) {
    return [];
  }

  const {
    baseTokenDetails: { decimals: baseTokenDecimals },
    quoteTokenDetails: { decimals: quoteTokenDecimals },
    brackets,
    prices,
    tokenBaseBalances,
    tokenQuoteBalances,
  } = strategy;

  return brackets.map((bracket, index) => ({
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
    balanceBase: new Decimal(
      formatAmountFull({
        amount: tokenBaseBalances[bracket.address],
        precision: baseTokenDecimals,
        thousandSeparator: false,
        isLocaleAware: false,
      })
    ),
    balanceQuote: new Decimal(
      formatAmountFull({
        amount: tokenQuoteBalances[bracket.address],
        precision: quoteTokenDecimals,
        thousandSeparator: false,
        isLocaleAware: false,
      })
    ),
  }));
}

export const StrategyTab = memo(function StrategyTab(
  props: Props
): JSX.Element {
  const { strategy } = props;
  const {
    baseTokenDetails,
    baseTokenAddress,
    quoteTokenDetails,
    quoteTokenAddress,
    brackets,
    priceRange,
  } = strategy;

  const { price } = useGetPrice({
    source: "GnosisProtocol",
    baseToken: baseTokenDetails,
    quoteToken: quoteTokenDetails,
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
        baseTokenAddress={baseTokenAddress}
        quoteTokenAddress={quoteTokenAddress}
        lowestPrice={priceRange?.lower.toString()}
        highestPrice={priceRange?.upper.toString()}
        totalBrackets={brackets.length}
        leftBrackets={baseTokenBrackets}
        rightBrackets={quoteTokenBrackets}
        startPrice={price?.isFinite() ? price.toString() : "N/A"}
      />
      <Grid>
        <BracketsTable
          baseTokenAddress={baseTokenAddress}
          quoteTokenAddress={quoteTokenAddress}
          type="left"
          brackets={leftBrackets}
        />
        <StrategyTotalValue strategy={strategy} />
        <BracketsTable
          baseTokenAddress={baseTokenAddress}
          quoteTokenAddress={quoteTokenAddress}
          type="right"
          brackets={rightBrackets}
        />
      </Grid>
    </Wrapper>
  );
});
