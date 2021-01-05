import React, { memo, useCallback, useEffect } from "react";
import { Field, useField, useForm } from "react-final-form";
import styled from "styled-components";
import BN from "bn.js";

import { formatAmountFull, ZERO } from "@gnosis.pm/dex-js";

import { useTokenDetails } from "hooks/useTokenDetails";
import { useTokenBalance } from "hooks/useTokenBalance";

import { TokenDetails } from "types";

import { theme } from "theme";

import { MAXIMUM_BRACKETS, MINIMUM_BRACKETS } from "utils/constants";

import { PriceInput } from "components/basic/inputs/PriceInput";
import { FundingInput } from "components/basic/inputs/FundingInput";
import { TotalBrackets } from "components/basic/inputs/TotalBrackets";

import { composeValidators } from "validators/misc";
import { isRequired } from "validators/isRequired";
import { isNumber } from "validators/isNumber";
import { isGreaterThan } from "validators/isGreaterThan";
import { isSmallerThan } from "validators/isSmallerThan";

import { FormFields } from "./types";

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
    border: 1px solid ${theme.colors.backgroundBadgeGray};
    border-radius: 16px;
  }
`;

export const PricesFragment = memo(function PricesFragment(): JSX.Element {
  const {
    input: { value: baseTokenAddress },
  } = useField<string>("baseTokenAddress");
  const {
    input: { value: quoteTokenAddress },
  } = useField<string>("quoteTokenAddress");
  const {
    input: { value: baseTokenAmount },
  } = useField<string>("baseTokenAmount");
  const {
    input: { value: baseTokenBrackets },
  } = useField<string>("baseTokenBrackets");
  const {
    input: { value: quoteTokenAmount },
  } = useField<string>("quoteTokenAmount");
  const {
    input: { value: quoteTokenBrackets },
  } = useField<string>("quoteTokenBrackets");

  const {
    mutators: { setFieldValue },
    change,
    resetFieldState,
  } = useForm();

  // Resetting amount fields when they are disabled
  const resetAmountField = useCallback(
    (bracketsInput: string, amountFieldName: string): void => {
      if (!+bracketsInput) {
        change(amountFieldName, undefined);
        resetFieldState(amountFieldName);
      }
    },
    [change, resetFieldState]
  );

  useEffect(() => resetAmountField(baseTokenBrackets, "baseTokenAmount"), [
    baseTokenBrackets,
    resetAmountField,
  ]);
  useEffect(() => resetAmountField(quoteTokenBrackets, "quoteTokenAmount"), [
    quoteTokenBrackets,
    resetAmountField,
  ]);

  const baseTokenDetails = useTokenDetails(baseTokenAddress);
  const quoteTokenDetails = useTokenDetails(quoteTokenAddress);

  const baseTokenBalance = useTokenBalance(baseTokenAddress);
  const quoteTokenBalance = useTokenBalance(quoteTokenAddress);

  const onMaxClickFactory = useCallback(
    (
      field: FormFields,
      tokenDetails: TokenDetails,
      maxBalance: BN | null
    ): void => {
      if (tokenDetails && maxBalance?.gt(ZERO)) {
        const value = formatAmountFull({
          amount: maxBalance,
          precision: tokenDetails.decimals,
          thousandSeparator: false,
          isLocaleAware: false,
        });
        setFieldValue(field, { value });
      }
    },
    [setFieldValue]
  );

  const onBaseTokenMaxClick = useCallback(
    () =>
      onMaxClickFactory("baseTokenAmount", baseTokenDetails, baseTokenBalance),
    [baseTokenDetails, onMaxClickFactory, baseTokenBalance]
  );
  const onQuoteTokenMaxClick = useCallback(
    () =>
      onMaxClickFactory(
        "quoteTokenAmount",
        quoteTokenDetails,
        quoteTokenBalance
      ),
    [onMaxClickFactory, quoteTokenDetails, quoteTokenBalance]
  );

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
              warn={meta.touched && meta.data?.warn}
              error={meta.touched && meta.error}
              tokenAddress={quoteTokenAddress}
              labelText="Lowest price"
              labelTooltip="The lowest price our strategy covers, lower than this you hold 100% token B"
            />
          )}
        />
        <Field<string>
          name="baseTokenAmount"
          // validation done at form level since this field might not be used
          render={({ input, meta }) => (
            <FundingInput
              {...input}
              warn={meta.touched && meta.data?.warn}
              error={meta.touched && meta.error}
              brackets={+baseTokenBrackets}
              tokenAddress={baseTokenAddress}
              onMaxClick={onBaseTokenMaxClick}
            />
          )}
        />
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
              warn={meta.touched && meta.data?.warn}
              error={meta.touched && meta.error}
              tokenAddress={quoteTokenAddress}
              labelText="Start Price"
              labelTooltip="Below the start price, brackets will be funded with token A. Above the start price, brackets will be funded with token B."
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
              warn={meta.touched && meta.data?.warn}
              error={meta.touched && meta.error}
              baseTokenAddress={baseTokenAddress}
              baseTokenAmount={baseTokenAmount}
              quoteTokenAddress={quoteTokenAddress}
              quoteTokenAmount={quoteTokenAmount}
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
              warn={meta.touched && meta.data?.warn}
              error={meta.touched && meta.error}
              tokenAddress={quoteTokenAddress}
              labelText="Highest price"
              labelTooltip="The max price per token A you are willing to sell or buy"
            />
          )}
        />
        <Field<string>
          name="quoteTokenAmount"
          // validation done at form level since this field might not be used
          render={({ input, meta }) => (
            <FundingInput
              {...input}
              warn={meta.touched && meta.data?.warn}
              error={meta.touched && meta.error}
              brackets={+quoteTokenBrackets}
              tokenAddress={quoteTokenAddress}
              onMaxClick={onQuoteTokenMaxClick}
            />
          )}
        />
      </div>
    </Wrapper>
  );
});
