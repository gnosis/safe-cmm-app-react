import React, { memo, useCallback, useContext } from "react";
import {
  FormApi,
  FormState,
  MutableState,
  Mutator,
  Tools,
  ValidationErrors,
} from "final-form";
import { Form, FormSpy } from "react-final-form";
import createCalculatedFieldsDecorator, {
  Calculation,
} from "final-form-calculate";

import { setFieldData } from "utils/finalForm";
import { calculateBrackets } from "utils/calculateBrackets";

import { isGreaterThan } from "validators/isGreaterThan";
import { isNumber } from "validators/isNumber";
import { isRequired } from "validators/isRequired";
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
    []
  );

  return <FormSpy subscription={{ values: true }} onChange={handleWarnings} />;
}

function validate(values: DeployFormValues): ValidationErrors {
  const errors: ValidationErrors = {};

  // prices values
  const lowestPrice = Number(values.lowestPrice);
  const startPrice = Number(values.startPrice);
  const highestPrice = Number(values.highestPrice);
  const totalBrackets = Number(values.totalBrackets);

  // this is a calculated field where we store two integers in a single string
  const baseTokenBrackets = getBracketValue(values.calculatedBrackets, "base");
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
    errors["baseTokenAmount"] = composeValidators("Token A Funding", [
      isRequired(),
      isNumber(),
      isGreaterThan(0),
    ])(values.baseTokenAmount);
  }

  if (quoteTokenBrackets > 0) {
    errors["quoteTokenAmount"] = composeValidators("Token B Funding", [
      isRequired(),
      isNumber(),
      isGreaterThan(0),
    ])(values.quoteTokenAmount);
  }

  return errors;
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

const component: React.FC = ({ children }) => {
  return (
    // TODO: if I set the form type like this, TS goes bananas with mutator type
    // <Form<DeployFormValues>
    <Form
      onSubmit={async (values) => {
        console.log(`form!!!`, values);
        return;
      }}
      mutators={{ setFieldData, swapTokens }}
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
};

export const DeployForm: typeof component = memo(component);
