import React, { memo, useCallback, useContext } from "react";
import PropTypes from "prop-types";
import {
  FormApi,
  FormState,
  MutableState,
  Mutator,
  Tools,
  FORM_ERROR,
} from "final-form";
import BN from "bn.js";
import Decimal from "decimal.js";

import { Form, FormSpy } from "react-final-form";
import createCalculatedFieldsDecorator, {
  Calculation,
} from "final-form-calculate";

import { parseAmount, ZERO } from "@gnosis.pm/dex-js";

import deployStrategy from "api/deployStrategy";

import { Web3Context } from "components/Web3Provider";
import { Web3Context as Web3ContextType } from "types";

import { setFieldData, setFieldValue } from "utils/finalForm";
import { calculateBrackets } from "utils/calculateBrackets";

import { ValidationErrors } from "validators/types";
import { isGreaterThan } from "validators/isGreaterThan";
import { isNumber } from "validators/isNumber";
import { isRequired } from "validators/isRequired";
import { hasBalanceFactory } from "validators/hasBalance";
import { composeValidators } from "validators/misc";

import { DeployFormValues, FormFields } from "./types";

function Warnings({
  mutators: { setFieldData },
}: Pick<FormApi, "mutators">): JSX.Element {
  const handleWarnings = useCallback(
    ({ values }: FormState<DeployFormValues>) => {
      setFieldData("lowestPrice", {
        warn: +values.lowestPrice < 1 ? "More than 1, please" : undefined,
      });
    },
    [setFieldData]
  );

  return <FormSpy subscription={{ values: true }} onChange={handleWarnings} />;
}

// Syntactic sugar to extract bracket value from stored input field value
export function getBracketValue(
  value: string | undefined,
  type: "base" | "quote"
): number {
  if (!value || !/\d+|\d+/.test(value)) {
    return 0;
  }
  const [base, quote] = value.split("|");
  return type === "base" ? +base : +quote;
}

// Calculate brackets based on all form fields
// Returns string with base/quote tokens concatenated separated by a `|`
const updateCalculatedBracketsFactory = (
  field: FormFields | RegExp
): Calculation => ({
  field,
  updates: {
    calculatedBrackets: (_: any, allValues: DeployFormValues): string => {
      const {
        lowestPrice,
        startPrice,
        highestPrice,
        totalBrackets,
      } = allValues;
      const { baseTokenBrackets, quoteTokenBrackets } = calculateBrackets({
        lowestPrice,
        startPrice,
        highestPrice,
        totalBrackets,
      });
      return `${baseTokenBrackets}|${quoteTokenBrackets}`;
    },
  },
});

// To be used on the swap tokens arrow
const swapTokens: Mutator = (
  _: any[],
  state: MutableState<any>, // not happy with DeployFormValues type :/
  { getIn, changeValue }: Tools<any>
) => {
  changeValue(state, "baseTokenAddress", () =>
    getIn(state, "quoteTokenAddress")
  );
  changeValue(state, "quoteTokenAddress", () =>
    getIn(state, "baseTokenAddress")
  );
};

// To be used inside calculate field decorator
const swapTokensCalculationFactory = (
  field: FormFields,
  oppositeField: FormFields
): Calculation => ({
  field,
  updates: {
    [oppositeField]: (
      value: string,
      allValues: DeployFormValues,
      prevValues: DeployFormValues
    ): string =>
      value === allValues[oppositeField]
        ? prevValues[field]
        : allValues[oppositeField],
  },
});

const calculateFieldsDecorator = createCalculatedFieldsDecorator(
  // Calculate brackets whenever (lowest/start/highest)Price or totalBrackets change
  updateCalculatedBracketsFactory(/Price$/),
  updateCalculatedBracketsFactory("totalBrackets"),
  // Whenever one of the select changes update the opposite selector
  swapTokensCalculationFactory("baseTokenAddress", "quoteTokenAddress"),
  swapTokensCalculationFactory("quoteTokenAddress", "baseTokenAddress")
);

// TODO: move this somewhere else
function priceToBn(price: string): BN {
  return new BN(new Decimal(price).mul(1e18).toString());
}

interface Props {
  children: React.ReactNode;
}

export const DeployForm = memo(function DeployForm({
  children,
}: Props): React.ReactElement {
  const context = useContext(Web3Context) as Web3ContextType;
  const { getErc20Details } = context;

  const hasBalance = useCallback(
    (tokenAddress: string) => hasBalanceFactory(getErc20Details)(tokenAddress),
    [getErc20Details]
  );

  const validate = useCallback(
    async (values: DeployFormValues): Promise<ValidationErrors> => {
      const errors: ValidationErrors = {};

      // prices values
      const lowestPrice = Number(values.lowestPrice);
      const startPrice = Number(values.startPrice);
      const highestPrice = Number(values.highestPrice);
      // const totalBrackets = Number(values.totalBrackets);

      // this is a calculated field where we store two integers in a single string
      const baseTokenBrackets = getBracketValue(
        values.calculatedBrackets,
        "base"
      );
      const quoteTokenBrackets = getBracketValue(
        values.calculatedBrackets,
        "quote"
      );

      if (lowestPrice > startPrice) {
        errors["lowestPrice"] = {
          label: "Lowest price can't be greater than Start price",
        };
        errors["startPrice"] = true;
      }
      if (highestPrice < startPrice) {
        errors["highestPrice"] = {
          label: "Highest price can't be smaller than Start price",
        };
        errors["startPrice"] = true;
      }
      if (lowestPrice === startPrice && startPrice === highestPrice) {
        errors["startPrice"] = { label: "All prices cannot be equal" };
        errors["lowestPrice"] = true;
        errors["highestPrice"] = true;
      }

      // Validate only if/when set
      if (baseTokenBrackets > 0) {
        errors["baseTokenAmount"] = await composeValidators("Token A Funding", [
          isRequired(),
          isNumber(),
          isGreaterThan(0),
          hasBalance(values.baseTokenAddress),
        ])(values.baseTokenAmount);
      }

      if (quoteTokenBrackets > 0) {
        errors["quoteTokenAmount"] = await composeValidators(
          "Token B Funding",
          [
            isRequired(),
            isNumber(),
            isGreaterThan(0),
            hasBalance(values.quoteTokenAddress),
          ]
        )(values.quoteTokenAmount);
      }

      return errors;
    },
    [hasBalance]
  );

  // const validate = useCallback(
  //   validateFactory(hasBalanceFactory(getErc20Details)),
  //   [getErc20Details]
  // );

  // The initial idea was to keep all the logic only on the container (index) component
  // But with the validations and final-form I didn't manage to.
  // Get back here later on and try to abide by that rule

  const onSubmit = useCallback(
    async (values: DeployFormValues): Promise<undefined | ValidationErrors> => {
      const {
        lowestPrice,
        highestPrice,
        baseTokenAmount,
        quoteTokenAmount,
        totalBrackets,
        startPrice,
        baseTokenAddress,
        quoteTokenAddress,
      } = values;

      const baseTokenDetails = await getErc20Details(baseTokenAddress);
      const quoteTokenDetails = await getErc20Details(quoteTokenAddress);

      if (!baseTokenDetails || !quoteTokenDetails) {
        return {
          [FORM_ERROR]: {
            label: "Failed to submit",
            children: "Couldn't to load required token data",
          },
        };
      }

      try {
        await deployStrategy(
          context,
          Number(totalBrackets),
          // addresses
          baseTokenAddress,
          quoteTokenAddress,
          // prices
          priceToBn(lowestPrice),
          priceToBn(highestPrice),
          // amounts
          parseAmount(baseTokenAmount, baseTokenDetails.decimals) || ZERO,
          parseAmount(quoteTokenAmount, quoteTokenDetails.decimals) || ZERO,
          // start price
          priceToBn(startPrice)
        );
        // success
        // TODO: go to tx screen maybe?
        return undefined;
      } catch (e) {
        return {
          [FORM_ERROR]: {
            label: "Failed to deploy strategy",
            children: e.message,
          },
        };
      }
    },
    [getErc20Details, context]
  );

  return (
    // TODO: if I set the form type like this, TS goes bananas with mutator type
    // <Form<DeployFormValues>
    <Form
      onSubmit={onSubmit}
      mutators={{ setFieldData, setFieldValue, swapTokens }}
      decorators={[calculateFieldsDecorator]}
      validate={validate}
      render={({ handleSubmit, form }) => (
        <form onSubmit={handleSubmit}>
          {children}
          <Warnings mutators={form.mutators} />
        </form>
      )}
    />
  );
});
