import React, { memo } from "react";
import { useRecoilValue } from "recoil";
import { Field } from "react-final-form";
import styled from "styled-components";

import { PriceInput } from "components/basic/inputs/PriceInput";
import { FundingInput } from "components/basic/inputs/FundingInput";
import { TotalBrackets } from "components/basic/inputs/TotalBrackets";

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

import { getBracketValue } from "./DeployForm";

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

const InvisibleField = styled(Field)`
  display: none;
`;

function component(): JSX.Element {
  const baseTokenAddress = useRecoilValue(baseTokenAddressAtom);
  const quoteTokenAddress = useRecoilValue(quoteTokenAddressAtom);
  const baseTokenAmount = useRecoilValue(baseTokenAmountAtom);
  const quoteTokenAmount = useRecoilValue(quoteTokenAmountAtom);
  const totalInvestment = useRecoilValue(totalInvestmentAtom);

  return (
    <Wrapper>
      <div>
        <Field<string>
          name="lowestPrice"
          validate={composeValidators("Lowest Price", [
            isRequired(),
            isNumber(),
            isGreaterThan(0),
          ])}
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
        <Field<string> name="calculatedBrackets" subscription={{ value: true }}>
          {({ input: { value } }) => (
            // Field `baseTokenAmount` is "subscribed" to field `calculatedBrackets`
            // `calculatedBrackets` value is a string storing "base|quote" brackets value
            <Field<string>
              name="baseTokenAmount"
              // validation done at form level since this field might not be used
              render={({ input, meta }) => (
                <FundingInput
                  {...input}
                  warn={meta.data?.warn}
                  error={meta.error}
                  brackets={getBracketValue(value, "base")}
                  tokenAddress={baseTokenAddress}
                />
              )}
            />
          )}
        </Field>
      </div>
      <div className="middle">
        <Field<string>
          name="startPrice"
          validate={composeValidators("Start Price", [
            isRequired(),
            isNumber(),
            isGreaterThan(0),
          ])}
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
          validate={composeValidators("Total Brackets", [
            isRequired(),
            isNumber(true),
            isGreaterThan(MINIMUM_BRACKETS - 1),
            isSmallerThan(MAXIMUM_BRACKETS + 1),
          ])}
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
          validate={composeValidators("Highest Price", [
            isRequired(),
            isNumber(),
            isGreaterThan(0),
          ])}
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
        <Field<string> name="calculatedBrackets" subscription={{ value: true }}>
          {({ input: { value } }) => (
            // Field `quoteTokenAmount` is "subscribed" to field `calculatedBrackets`
            // `calculatedBrackets` value is a string storing "base|quote" brackets value
            <Field<string>
              name="quoteTokenAmount"
              // validation done at form level since this field might not be used
              render={({ input, meta }) => (
                <FundingInput
                  {...input}
                  warn={meta.data?.warn}
                  error={meta.error}
                  brackets={getBracketValue(value, "quote")}
                  tokenAddress={quoteTokenAddress}
                />
              )}
            />
          )}
        </Field>
      </div>
      {/* stores the calculated brackets as string separated by a '|' */}
      <InvisibleField name="calculatedBrackets" component="input" />
    </Wrapper>
  );
}

export const PricesFragment = memo(component);
