import React from "react";
import styled from "styled-components";

import { Text, ButtonLink } from "@gnosis.pm/safe-react-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;

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
  error?: boolean;
}

export const Label = (props: Props): JSX.Element => {
  const { onClick, error } = props;
  return (
    <Wrapper {...props}>
      <Text size="lg" strong color={error ? "error" : null}>
        Funding
      </Text>
      <ButtonLink type="button" color="primary" textSize="lg" onClick={onClick}>
        max
      </ButtonLink>
    </Wrapper>
  );
};
