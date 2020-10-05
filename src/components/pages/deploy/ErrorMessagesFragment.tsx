import React, { memo } from "react";
import styled from "styled-components";

import { Message } from "components/basic/display/Message";

import { useFormState } from "react-final-form";

const Wrapper = styled.div`
  & > :not(:last-child) {
    margin-bottom: 5px;
  }
`;

function UErrorMessageFragment(): JSX.Element {
  const { errors = {}, touched = {}, submitErrors = {} } = useFormState({
    subscription: { errors: true, touched: true, submitErrors: true },
  });

  if ((!errors || !Object.values(touched).some(Boolean)) && !submitErrors) {
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
    </Wrapper>
  );
}

export const ErrorMessagesFragment: typeof UErrorMessageFragment = memo(
  UErrorMessageFragment
);
