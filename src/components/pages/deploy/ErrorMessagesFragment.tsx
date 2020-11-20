import React, { memo } from "react";
import { useFormState } from "react-final-form";
import styled from "styled-components";

import { Message } from "components/basic/display/Message";

import { DeployFormValues } from "./types";
import { useWarnings } from "./useWarnings";

const Wrapper = styled.div`
  & > :not(:last-child) {
    margin-bottom: 5px;
  }
`;

export const ErrorMessagesFragment = memo(
  function ErrorMessageFragment(): JSX.Element {
    const {
      errors = {},
      touched = {},
      submitErrors = {},
      values,
    } = useFormState<DeployFormValues>({
      subscription: {
        errors: true,
        touched: true,
        submitErrors: true,
        values: true,
      },
    });

    const warnings = useWarnings(values);

    if (
      (!errors || !Object.values(touched).some(Boolean)) &&
      !submitErrors &&
      !Object.values(warnings).some(Boolean)
    ) {
      return null;
    }

    const allErrors = { ...errors, ...submitErrors };

    return (
      <Wrapper>
        {Object.keys(errors)
          .filter(
            (fieldName) =>
              // Only show errors messages when we have one
              // Sometimes a field is set with 'error === true' only to highlight the component
              // to avoid multiple messages for the same error that affects multiple components
              // Also, do not show error messages for fields not `touched`
              typeof allErrors[fieldName] !== "boolean" && touched[fieldName]
          )
          // Add submitErrors last because if they are here they should be displayed
          // and also since they do not correlate to a field, it won't be in the `touched` obj
          .concat(Object.keys(submitErrors))
          .map((fieldName, id) => (
            <Message {...allErrors[fieldName]} type="error" key={id} />
          ))}
        {Object.values(warnings)
          .filter((warning) => !!warning)
          .map((warning, id) => {
            // Casting needed because warning can be either the obj below or false.
            // Even though we are filtering the only case where a boolean is possible, TS doesn't know that.
            const { label, children } = warning as {
              label: string;
              children?: React.ReactNode;
            };
            return (
              <Message label={label} type="warning" key={id}>
                {children}
              </Message>
            );
          })}
      </Wrapper>
    );
  }
);
