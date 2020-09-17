import React, { useContext, memo } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";

import { Message } from "components/basic/display/Message";

import { messagesSelector } from "recoil/selectors";

const Wrapper = styled.div`
  & > :not(:last-child) {
    margin-bottom: 5px;
  }
`;

function component(): JSX.Element {
  const messages = useRecoilValue(messagesSelector);

  if (!messages) {
    return null;
  }

  return (
    messages && (
      <Wrapper className="messages">
        {messages.map((msgProps, id) => (
          <Message {...msgProps} key={id} />
        ))}
      </Wrapper>
    )
  );
}

export const ErrorMessagesFragment = memo(component);
