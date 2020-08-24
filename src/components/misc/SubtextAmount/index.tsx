import React from "react";
import styled from "styled-components";

import { Text } from "@gnosis.pm/safe-react-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  padding-top: 0.4em;

  p:first-of-type {
    padding-bottom: 0.2em;
  }
`;

export interface Props {
  subtext: string;
  amount: string | React.ReactElement;
}

export const SubtextAmount = (props: Props): JSX.Element => {
  const { subtext, amount } = props;

  return (
    <Wrapper>
      <Text size="md" center strong color="shadow">
        {subtext}
      </Text>
      <Text size="md" center strong>
        {amount}
      </Text>
    </Wrapper>
  );
};
