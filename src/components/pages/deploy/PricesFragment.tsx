import React, { memo, useCallback, useMemo } from "react";
import { RecoilState, useRecoilCallback, useRecoilValue } from "recoil";
import { Field, useFormState } from "react-final-form";
import styled from "styled-components";

import { PriceInput } from "components/basic/inputs/PriceInput";
import { FundingInput } from "components/basic/inputs/FundingInput";
import { TotalBrackets } from "components/basic/inputs/TotalBrackets";

import { calculateBrackets } from "utils/calculateBrackets";

import { composeValidators } from "validators/misc";
import { isRequired } from "validators/isRequired";
import { isNumber } from "validators/isNumber";
import { isGreaterThan } from "validators/isGreaterThan";
import { isSmallerThan } from "validators/isSmallerThan";
import { MAXIMUM_BRACKETS, MINIMUM_BRACKETS } from "utils/constants";

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
  const totalInvestment = useRecoilValue(totalInvestmentAtom);

  const {
    values: { lowestPrice, startPrice, highestPrice, totalBrackets },
  } = useFormState({ subscription: { values: true } });

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
          validate={composeValidators(
            isRequired("Token A Funding"),
            isNumber("Lowest Price")
          )}
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
          validate={composeValidators(
            isRequired("Token A Funding"),
            isNumber("Token A Funding")
          )}
          render={({ input, meta }) => (
            <FundingInput
              {...input}
              warn={meta.data?.warn}
              error={meta.error}
              brackets={baseTokenBrackets}
              tokenAddress={baseTokenAddress}
            />
          )}
        />
      </div>
      <div className="middle">
        <Field<string>
          name="startPrice"
          validate={composeValidators(
            isRequired("Start Price"),
            isNumber("Start Price")
          )}
          render={({ input, meta }) => (
            <PriceInput
              {...input}
              warn={meta.data?.warn}
              error={meta.error}
              tokenAddress={baseTokenAddress}
              labelText="Start Price"
              labelTooltip="Bellow the start price, brackets will be funded with token A. Above the start price, brackets will be funded with token B."
              labelSize="xl"
            />
          )}
        />
        <Field<string>
          name="totalBrackets"
          validate={composeValidators(
            isRequired("Total Brackets"),
            isNumber("Total Brackets", true),
            isGreaterThan("Total Brackets", MINIMUM_BRACKETS - 1),
            isSmallerThan("Total Brackets", MAXIMUM_BRACKETS + 1)
          )}
          render={({ input, meta }) => (
            <TotalBrackets
              {...input}
              warn={meta.data?.warn}
              error={meta.error}
              amount={totalInvestment}
            />
          )}
        />
      </div>
      <div>
        <Field<string>
          name="highestPrice"
          validate={composeValidators(
            isRequired("Highest Price"),
            isNumber("Highest Price")
          )}
          render={({ input, meta }) => (
            <PriceInput
              {...input}
              warn={meta.data?.warn}
              error={meta.error}
              tokenAddress={baseTokenAddress}
              labelText="Highest price"
              labelTooltip="The max price per token A you are willing to sell or buy"
            />
          )}
        />
        <Field<string>
          name="quoteTokenAmount"
          validate={composeValidators(
            isRequired("Token B Funding"),
            isNumber("Token B Funding")
          )}
          render={({ input, meta }) => (
            <FundingInput
              {...input}
              warn={meta.data?.warn}
              error={meta.error}
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
