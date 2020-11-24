import React, { memo, useCallback } from "react";
import { Field, useField, useForm } from "react-final-form";
import styled from "styled-components";

import { formatAmountFull, ZERO } from "@gnosis.pm/dex-js";

import { useTokenDetails } from "hooks/useTokenDetails";

import { TokenDetails } from "types";

import { MAXIMUM_BRACKETS, MINIMUM_BRACKETS } from "utils/constants";

import { PriceInput } from "components/basic/inputs/PriceInput";
import { FundingInput } from "components/basic/inputs/FundingInput";
import { TotalBrackets } from "components/basic/inputs/TotalBrackets";

import { composeValidators } from "validators/misc";
import { isRequired } from "validators/isRequired";
import { isNumber } from "validators/isNumber";
import { isGreaterThan } from "validators/isGreaterThan";
import { isSmallerThan } from "validators/isSmallerThan";

import { getBracketValue } from "./DeployForm";
import { FormFields } from "./types";
import { useTokenBalance } from "hooks/useTokenBalance";

import BN from "bn.js";

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
    input: { value: quoteTokenAmount },
  } = useField<string>("quoteTokenAmount");

  const {
    mutators: { setFieldValue },
  } = useForm();

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
                  warn={meta.touched && meta.data?.warn}
                  error={meta.touched && meta.error}
                  brackets={getBracketValue(value, "base")}
                  tokenAddress={baseTokenAddress}
                  onMaxClick={onBaseTokenMaxClick}
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
              warn={meta.touched && meta.data?.warn}
              error={meta.touched && meta.error}
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
                  warn={meta.touched && meta.data?.warn}
                  error={meta.touched && meta.error}
                  brackets={getBracketValue(value, "quote")}
                  tokenAddress={quoteTokenAddress}
                  onMaxClick={onQuoteTokenMaxClick}
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
});
