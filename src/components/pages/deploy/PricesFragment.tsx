import React, { memo, useContext } from "react";
import styled from "styled-components";

import { PriceInput } from "components/basic/inputs/PriceInput";
import { FundingInput } from "components/basic/inputs/FundingInput";
import { TotalBrackets } from "components/basic/inputs/TotalBrackets";

import { DeployPageContext } from "./viewer";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;

  & > div {
    padding: 16px 13px;

    & > div:first-child {
      margin-bottom: 15px;
    }
  }

  & > div:first-child {
    padding-left: 0;
  }
  & > div:last-child {
    padding-right: 0;
  }

  .middle {
    padding-top: 13px;
    border: 1px solid #e8e7e6;
    border-radius: 16px;
  }
`;

function component(): JSX.Element {
  const {
    baseTokenAddress,
    quoteTokenAddress,
    baseTokenAmount,
    quoteTokenAmount,
    totalBrackets,
    totalInvestment,
    baseTokenBrackets,
    quoteTokenBrackets,
    startPrice,
    lowestPrice,
    highestPrice,
    // callbacks
    onLowestPriceChange,
    onStartPriceChange,
    onHighestPriceChange,
    onBaseTokenAmountChange,
    onQuoteTokenAmountChange,
    onTotalBracketsChange,
  } = useContext(DeployPageContext);

  return (
    <Wrapper>
      <div>
        <PriceInput
          tokenAddress={baseTokenAddress}
          labelText="Lowest price"
          labelTooltip="The lowest price our strategy covers, lower than this you hold 100% token B"
          value={lowestPrice}
          onChange={onLowestPriceChange}
        />
        <FundingInput
          brackets={baseTokenBrackets}
          tokenAddress={baseTokenAddress}
          value={baseTokenAmount}
          onChange={onBaseTokenAmountChange}
        />
      </div>
      <div className="middle">
        <PriceInput
          tokenAddress={baseTokenAddress}
          labelText="Start Price"
          labelTooltip="Bellow the start price, brackets will be funded with token A. Above the start price, brackets will be funded with token B."
          value={startPrice}
          labelSize="xl"
          onChange={onStartPriceChange}
        />
        <TotalBrackets
          value={totalBrackets}
          amount={totalInvestment}
          onChange={onTotalBracketsChange}
        />
      </div>
      <div>
        <PriceInput
          tokenAddress={baseTokenAddress}
          labelText="Highest price"
          labelTooltip="The max price per token A you are willing to sell or buy"
          value={highestPrice}
          onChange={onHighestPriceChange}
        />
        <FundingInput
          brackets={quoteTokenBrackets}
          tokenAddress={quoteTokenAddress}
          value={quoteTokenAmount}
          onChange={onQuoteTokenAmountChange}
        />
      </div>
    </Wrapper>
  );
}

export const PricesFragment = memo(component);
