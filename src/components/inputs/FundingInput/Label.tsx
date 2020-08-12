import React from "react";
import styled from "styled-components";

import { Text, ButtonLink } from "@gnosis.pm/safe-react-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;

  padding-bottom: 0.4em;

  button {
    padding: 0;

    p {
      text-transform: uppercase;
      font-size: 0.75em;
      font-weight: bold;
    }
  }
`;

interface Props {
  onClick: (e: React.SyntheticEvent) => void;
}

export const Label = (props: Props): JSX.Element => {
  const { onClick } = props;
  return (
    <Wrapper>
      <Text size="lg" strong>
        Funding
      </Text>
      <ButtonLink color="primary" textSize="lg" onClick={onClick}>
        max
      </ButtonLink>
    </Wrapper>
  );
};
