import React, { memo } from "react";
import styled from "styled-components";

import { Text } from "components/basic/display/Text";
import { ButtonLink } from "components/basic/inputs/ButtonLink";

const Wrapper = styled.span`
  display: flex;
  justify-content: space-between;
  flex-wrap: nowrap;
`;

interface Props {
  onClick?: (e: React.SyntheticEvent) => void;
  error?: boolean;
  disabled?: boolean;
}

export const Label = memo(function Label(props: Props): JSX.Element {
  const { onClick, error, disabled } = props;
  return (
    <Wrapper {...props}>
      <Text
        size="lg"
        strong
        color={error ? "error" : disabled ? "disabled" : null}
        as="span"
      >
        Funding
      </Text>
      <ButtonLink
        type="button"
        color="primary"
        textSize="lg"
        onClick={onClick}
        disabled={disabled}
      >
        max
      </ButtonLink>
    </Wrapper>
  );
});
