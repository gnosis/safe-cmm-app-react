import React, { memo, useCallback } from "react";
import { FormApi, FormState, ValidationErrors } from "final-form";
import { Form, FormSpy } from "react-final-form";
import createCalculatedFieldsDecorator from "final-form-calculate";

import { setFieldData } from "utils/finalForm";
import { calculateBrackets } from "utils/calculateBrackets";

import { isGreaterThan } from "validators/isGreaterThan";
import { isNumber } from "validators/isNumber";
import { isRequired } from "validators/isRequired";
import { composeValidators } from "validators/misc";

import { DeployFormValues } from "./types";

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
  const [
    baseTokenBrackets,
    quoteTokenBrackets,
  ] = values.calculatedBrackets?.split("|") || [0, 0];

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

function updateCalculatedBrackets(
  _: string | number,
  allValues: DeployFormValues
): string {
  const { lowestPrice, startPrice, highestPrice, totalBrackets } = allValues;
  const { baseTokenBrackets, quoteTokenBrackets } = calculateBrackets({
    lowestPrice,
    startPrice,
    highestPrice,
    totalBrackets,
  });
  return `${baseTokenBrackets}|${quoteTokenBrackets}`;
}

const calculateFieldsDecorator = createCalculatedFieldsDecorator(
  {
    field: /Price$/,
    updates: { calculatedBrackets: updateCalculatedBrackets },
  },
  {
    field: "totalBrackets",
    updates: { calculatedBrackets: updateCalculatedBrackets },
  }
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
      mutators={{ setFieldData }}
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
