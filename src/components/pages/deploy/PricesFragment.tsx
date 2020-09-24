import React, { memo, useCallback } from "react";
import { RecoilState, useRecoilCallback, useRecoilValue } from "recoil";
import styled from "styled-components";

import { PriceInput } from "components/basic/inputs/PriceInput";
import { FundingInput } from "components/basic/inputs/FundingInput";
import { TotalBrackets } from "components/basic/inputs/TotalBrackets";

import {
  baseTokenAddressAtom,
  baseTokenAmountAtom,
  highestPriceAtom,
  lowestPriceAtom,
  quoteTokenAddressAtom,
  quoteTokenAmountAtom,
  startPriceAtom,
  totalBracketsAtom,
  totalInvestmentAtom,
} from "./atoms";
import {
  baseTokenBracketsSelector,
  quoteTokenBracketsSelector,
} from "./selectors";

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
  const baseTokenAddress = useRecoilValue(baseTokenAddressAtom);
  const quoteTokenAddress = useRecoilValue(quoteTokenAddressAtom);
  const baseTokenBrackets = useRecoilValue(baseTokenBracketsSelector);
  const quoteTokenBrackets = useRecoilValue(quoteTokenBracketsSelector);
  const baseTokenAmount = useRecoilValue(baseTokenAmountAtom);
  const quoteTokenAmount = useRecoilValue(quoteTokenAmountAtom);
  const totalBrackets = useRecoilValue(totalBracketsAtom);
  const totalInvestment = useRecoilValue(totalInvestmentAtom);
  const startPrice = useRecoilValue(startPriceAtom);
  const lowestPrice = useRecoilValue(lowestPriceAtom);
  const highestPrice = useRecoilValue(highestPriceAtom);

  const onChangeHandlerFactory = useRecoilCallback(
    ({ set }) => (atom: RecoilState<string>) => (
      event: React.ChangeEvent<HTMLInputElement>
    ): void => {
      set(atom, event.target.value);
    }
  );

  const onLowestPriceChange = useCallback(
    onChangeHandlerFactory(lowestPriceAtom),
    []
  );
  const onBaseTokenAmountChange = useCallback(
    onChangeHandlerFactory(baseTokenAmountAtom),
    []
  );
  const onStartPriceChange = useCallback(
    onChangeHandlerFactory(startPriceAtom),
    []
  );
  const onTotalBracketsChange = useCallback(
    onChangeHandlerFactory(totalBracketsAtom),
    []
  );
  const onHighestPriceChange = useCallback(
    onChangeHandlerFactory(highestPriceAtom),
    []
  );
  const onQuoteTokenAmountChange = useCallback(
    onChangeHandlerFactory(quoteTokenAmountAtom),
    []
  );

  return (
    <Wrapper>
      <div>
        <PriceInput
          tokenAddress={quoteTokenAddress}
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
          tokenAddress={quoteTokenAddress}
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
          tokenAddress={quoteTokenAddress}
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
