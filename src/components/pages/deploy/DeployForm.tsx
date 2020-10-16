import React, { memo, useCallback, useContext } from "react";
import { useRecoilValue } from "recoil";
import { FormApi, FormState, MutableState, Mutator, Tools } from "final-form";
import { Form, FormSpy } from "react-final-form";
import createCalculatedFieldsDecorator, {
  Calculation,
} from "final-form-calculate";

import { useDeployStrategy } from "hooks/useDeployStrategy";

import { setFieldData, setFieldValue } from "utils/finalForm";
import { calculateBrackets } from "utils/calculateBrackets";

import { tokenBalancesState } from "state/atoms";

import { ValidationErrors } from "validators/types";
import { isGreaterThan } from "validators/isGreaterThan";
import { isNumber } from "validators/isNumber";
import { isRequired } from "validators/isRequired";
import { hasBalanceFactory } from "validators/hasBalance";
import { composeValidators } from "validators/misc";

import { DeployFormValues, FormFields } from "./types";
import { ContractInteractionContext } from "components/context/ContractInteractionProvider";

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

interface Props {
  children: React.ReactNode;
}

export const DeployForm = memo(function DeployForm({
  children,
}: Props): React.ReactElement {
  const context = useContext(ContractInteractionContext);
  const { getErc20Details } = context;
  const tokenBalances = useRecoilValue(tokenBalancesState);

  const hasBalance = useCallback(
    (tokenAddress: string) =>
      hasBalanceFactory(getErc20Details)(
        tokenAddress,
        tokenBalances[tokenAddress] // TODO: show a warning when not able to fetch token balance?
      ),
    [tokenBalances, getErc20Details]
  );

  const validate = useCallback(
    async (values: DeployFormValues): Promise<ValidationErrors> => {
      const errors: ValidationErrors = {};

      // prices values
      const lowestPrice = Number(values.lowestPrice);
      const highestPrice = Number(values.highestPrice);

      // this is a calculated field where we store two integers in a single string
      const baseTokenBrackets = getBracketValue(
        values.calculatedBrackets,
        "base"
      );
      const quoteTokenBrackets = getBracketValue(
        values.calculatedBrackets,
        "quote"
      );

      if (lowestPrice >= highestPrice) {
        errors["lowestPrice"] = {
          label: "Lowest Price must be smaller than Highest Price",
        };
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

  const deployStrategy = useDeployStrategy();

  const onSubmit = useCallback(
    async (values: DeployFormValues): Promise<undefined | ValidationErrors> => {
      const result = await deployStrategy(values);

      // TODO: when result === `undefined`, deploy succeeded.
      // TODO: do something like reset form, redirect to pending strategies, etc
      return result;
    },
    [deployStrategy]
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
