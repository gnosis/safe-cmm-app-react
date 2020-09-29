import React, { memo, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { Backdrop, withStyles } from "@material-ui/core";
import styled from "styled-components";
import { FormApi, FormState } from "final-form";
import createCalculatedFieldsDecorator from "final-form-calculate";
import { Form, FormSpy } from "react-final-form";

import { Loader } from "@gnosis.pm/safe-react-components";

import { setFieldData } from "utils/finalForm";

import { SideBar } from "./SideBar";
import { TokenSelectorsFragment } from "./TokenSelectorsFragment";
import { PricesFragment } from "./PricesFragment";
import { MarketPriceFragment } from "./MarketPriceFragment";
import { ErrorMessagesFragment } from "./ErrorMessagesFragment";
import { DeployStrategyButtonFragment } from "./DeployStrategyButtonFragment";
import { isSubmittingAtom } from "./atoms";
import { DeployFormValues, FormFields } from "./types";
import { ValidationErrors } from "validators/types";
import { isNumber } from "validators/isNumber";
import { composeValidators } from "validators/misc";
import { isRequired } from "validators/isRequired";
import { isGreaterThan } from "validators/isGreaterThan";
import { calculateBrackets } from "utils/calculateBrackets";

const PageLayout = styled.div`
  display: flex;
  min-width: 860px;
`;

const DeployWidget = styled.div`
  // basic dimensions
  max-width: 444px;
  min-height: 482px;

  padding: 16px 13px;

  // Some space for sidebar
  margin-right: 48px;

  // Spacing between elements
  & > *:not(:last-child) {
    margin-bottom: 16px;
  }

  // fancy border
  border-radius: 16px;
  box-shadow: 0 20px 24px 0 rgba(0, 20, 40, 0.05),
    0 0 10px 0 rgba(0, 20, 40, 0.08);

  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const StyledBackdrop = withStyles(() => ({ root: { zIndex: 999 } }))(Backdrop);

export interface Props {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

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

function component(props: Props): JSX.Element {
  const { onSubmit } = props;
  const isSubmitting = useRecoilValue(isSubmittingAtom);

  return (
    <PageLayout>
      {/* TODO: if I set the form type like this, TS goes bananas with mutator type  */}
      {/* <Form<DeployFormValues> */}
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
            <DeployWidget>
              <TokenSelectorsFragment />
              <MarketPriceFragment />
              <PricesFragment />
              <ErrorMessagesFragment />
              <DeployStrategyButtonFragment />
            </DeployWidget>
            <Warnings mutators={form.mutators} />
          </form>
        )}
      />
      <SideBar />
      <StyledBackdrop open={isSubmitting}>
        <Loader size="lg" color="primaryLight" />
      </StyledBackdrop>
    </PageLayout>
  );
}

export const DeployPageViewer: typeof component = memo(component);
