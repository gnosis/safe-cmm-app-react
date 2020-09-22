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
  const { errors } = useFormState({ subscription: { errors: true } });

  if (!errors) {
    return null;
  }

  return (
    <Wrapper className="messages">
      {Object.values(errors).map((error, id) => (
        <Message {...error} type="error" key={id} />
      ))}
    </Wrapper>
  );
}

export const ErrorMessagesFragment = memo(component);
