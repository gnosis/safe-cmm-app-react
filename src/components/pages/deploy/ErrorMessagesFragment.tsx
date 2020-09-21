import React, { useContext, memo } from "react";
import styled from "styled-components";

import { Message } from "components/basic/display/Message";

import { DeployPageContext } from "./viewer";

const Wrapper = styled.div`
  & > * {
    margin-bottom: 5px;
  }
  & > :last-child {
    margin-bottom: 0;
  }
`;

function component(): JSX.Element {
  const { messages } = useContext(DeployPageContext);

  if (!messages) {
    return null;
  }

  return (
    messages && (
      <Wrapper className="messages">
        {messages.map((msgProps) => (
          <Message {...msgProps} />
        ))}
      </Wrapper>
    )
  );
}

export const ErrorMessagesFragment = memo(component);
