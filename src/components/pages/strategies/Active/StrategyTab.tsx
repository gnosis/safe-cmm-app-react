import React, { memo } from "react";
import styled from "styled-components";
import Decimal from "decimal.js";

import { formatAmount } from "@gnosis.pm/dex-js";

import { useGetPrice } from "hooks/useGetPrice";

import { ZERO_DECIMAL } from "utils/constants";
import { calculateBracketsFromMarketPrice } from "utils/calculateBrackets";

import Strategy from "logic/strategy";

import { BracketsViewer } from "components/basic/display/BracketsView";
import {
  BracketRowData,
  BracketsTable,
} from "components/basic/display/BracketsTable";

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
    balanceBase: formatAmount(
      tokenBaseBalances[bracket.address],
      baseTokenDecimals
    ),
    balanceQuote: formatAmount(
      tokenQuoteBalances[bracket.address],
      quoteTokenDecimals
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

  const {
    baseTokenBrackets,
    quoteTokenBrackets,
  } = calculateBracketsFromMarketPrice({
    marketPrice: price || ZERO_DECIMAL,
    totalBrackets: brackets.length,
    lowestPrice: priceRange?.lower || ZERO_DECIMAL,
    highestPrice: priceRange?.upper || ZERO_DECIMAL,
  });

  const tableBrackets = formatBrackets(strategy);

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
          brackets={tableBrackets.slice(0, baseTokenBrackets)}
        />
        <div style={{ justifySelf: "center" }}>TODO</div>
        <BracketsTable
          baseTokenAddress={baseTokenAddress}
          quoteTokenAddress={quoteTokenAddress}
          type="right"
          brackets={tableBrackets.slice(baseTokenBrackets)}
        />
      </Grid>
    </Wrapper>
  );
});
