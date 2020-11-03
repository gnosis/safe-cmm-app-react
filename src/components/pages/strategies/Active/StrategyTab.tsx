import React, { memo } from "react";
import styled from "styled-components";
import Decimal from "decimal.js";

import { formatAmount } from "@gnosis.pm/dex-js";

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
  align-items: center;
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

  const brackets = formatBrackets(strategy);

  return (
    <Wrapper>
      <BracketsViewer
        type="strategy"
        baseTokenAddress={strategy.baseTokenAddress}
        quoteTokenAddress={strategy.quoteTokenAddress}
        lowestPrice={strategy.priceRange?.lower.toString()}
        highestPrice={strategy.priceRange?.upper.toString()}
        totalBrackets={strategy.brackets?.length}
      />
      <Grid>
        <BracketsTable
          baseTokenAddress={strategy.baseTokenAddress}
          quoteTokenAddress={strategy.quoteTokenAddress}
          type="left"
          brackets={brackets}
        />
        <div style={{ justifySelf: "center" }}>TODO</div>
        <BracketsTable
          baseTokenAddress={strategy.baseTokenAddress}
          quoteTokenAddress={strategy.quoteTokenAddress}
          type="right"
          brackets={brackets}
        />
      </Grid>
    </Wrapper>
  );
});
