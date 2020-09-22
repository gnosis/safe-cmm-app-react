import React, { memo, useCallback, useMemo } from "react";
import { RecoilState, useRecoilCallback, useRecoilValue } from "recoil";
import { Field } from "react-final-form";
import styled from "styled-components";

import { PriceInput } from "components/basic/inputs/PriceInput";
import { FundingInput } from "components/basic/inputs/FundingInput";
import { TotalBrackets } from "components/basic/inputs/TotalBrackets";

import { calculateBrackets } from "utils/calculateBrackets";

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
  const baseTokenAmount = useRecoilValue(baseTokenAmountAtom);
  const quoteTokenAmount = useRecoilValue(quoteTokenAmountAtom);
  const totalBrackets = useRecoilValue(totalBracketsAtom);
  const totalInvestment = useRecoilValue(totalInvestmentAtom);
  const startPrice = useRecoilValue(startPriceAtom);
  const lowestPrice = useRecoilValue(lowestPriceAtom);
  const highestPrice = useRecoilValue(highestPriceAtom);

  const { baseTokenBrackets, quoteTokenBrackets } = useMemo(() => {
    const lp = Number(lowestPrice);
    const sp = Number(startPrice);
    const hp = Number(highestPrice);
    const tb = Number(totalBrackets);

    if (
      isNaN(lp) ||
      isNaN(sp) ||
      isNaN(hp) ||
      isNaN(tb) ||
      lp <= 0 ||
      lp > sp ||
      sp > hp ||
      tb <= 0
    ) {
      return { baseTokenBrackets: 0, quoteTokenBrackets: 0 };
    } else {
      return calculateBrackets({
        lowestPrice,
        startPrice,
        highestPrice,
        totalBrackets,
      });
    }
  }, [lowestPrice, startPrice, highestPrice, totalBrackets]);

  return (
    <Wrapper>
      <div>
        <Field<string>
          name="lowestPrice"
          render={({ input, meta }) => (
            <PriceInput
              {...input}
              warn={meta.data?.warn}
              error={meta.error}
              tokenAddress={baseTokenAddress}
              labelText="Lowest price"
              labelTooltip="The lowest price our strategy covers, lower than this you hold 100% token B"
            />
          )}
        />
        <Field<string>
          name="baseTokenAmount"
          render={(props) => (
            <FundingInput
              {...props.input}
              brackets={baseTokenBrackets}
              tokenAddress={baseTokenAddress}
            />
          )}
        />
      </div>
      <div className="middle">
        <Field<string>
          name="startPrice"
          render={(props) => (
            <PriceInput
              {...props.input}
              tokenAddress={baseTokenAddress}
              labelText="Start Price"
              labelTooltip="Bellow the start price, brackets will be funded with token A. Above the start price, brackets will be funded with token B."
              labelSize="xl"
            />
          )}
        />
        <Field<string>
          name="totalBrackets"
          render={(props) => (
            <TotalBrackets {...props.input} amount={totalInvestment} />
          )}
        />
      </div>
      <div>
        <Field<string>
          name="highestPrice"
          render={(props) => (
            <PriceInput
              {...props.input}
              tokenAddress={baseTokenAddress}
              labelText="Highest price"
              labelTooltip="The max price per token A you are willing to sell or buy"
            />
          )}
        />
        <Field<string>
          name="quoteTokenAmount"
          render={(props) => (
            <FundingInput
              {...props.input}
              brackets={quoteTokenBrackets}
              tokenAddress={quoteTokenAddress}
            />
          )}
        />
      </div>
    </Wrapper>
  );
}

export const PricesFragment = memo(component);
