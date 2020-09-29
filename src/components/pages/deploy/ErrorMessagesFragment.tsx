import React, { memo } from "react";
import styled from "styled-components";

import { Message } from "components/basic/display/Message";

import { useFormState } from "react-final-form";

const Wrapper = styled.div`
  & > :not(:last-child) {
    margin-bottom: 5px;
  }
`;

function component(): JSX.Element {
  const { errors, touched } = useFormState({
    subscription: { errors: true, touched: true },
  });

  if (!errors || !Object.values(touched).some(Boolean)) {
    return null;
  }

  return (
    <Wrapper>
      {Object.keys(errors)
        .filter(
          (fieldName) =>
            // Only show errors messages when we have one
            // Sometimes a field is set with 'error === true' only to highlight the component
            // to avoid multiple messages for the same error that affects multiple components
            // Also, do not show error messages for fields not `touched`
            typeof errors[fieldName] !== "boolean" && touched[fieldName]
        )
        .map((fieldName, id) => (
          <Message {...errors[fieldName]} type="error" key={id} />
        ))}
    </Wrapper>
  );
}

export const ErrorMessagesFragment = memo(component);
