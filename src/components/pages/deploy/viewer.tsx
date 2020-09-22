import React, { memo, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { Backdrop, withStyles } from "@material-ui/core";
import styled from "styled-components";
import { Config, FormApi, FormState } from "final-form";
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

export interface ValidationError {
  label: string;
  body?: React.ReactNode;
}
export interface ValidationErrors {
  [field: string]: ValidationError;
}

// TODO: adjust the type of `setFieldData`
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
        validate={(values: DeployFormValues) => {
          const errors: ValidationErrors = {};
          if (!values.lowestPrice) {
            errors["lowestPrice"] = { label: " Lowest Price is required" };
          }

          return errors;
        }}
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
