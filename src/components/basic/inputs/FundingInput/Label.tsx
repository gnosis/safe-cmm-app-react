import React from "react";
import styled from "styled-components";

import { Text } from "@gnosis.pm/safe-react-components";

import { ButtonLink } from "components/basic/inputs/ButtonLink";

const Wrapper = styled.span`
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
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
