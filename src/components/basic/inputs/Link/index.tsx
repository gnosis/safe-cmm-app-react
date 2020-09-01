import React, { ComponentPropsWithoutRef } from "react";
import styled from "styled-components";

import { theme, Text } from "@gnosis.pm/safe-react-components";

import { Props as ButtonLinkProps } from "components/basic/inputs/ButtonLink";

export type Props = Pick<ButtonLinkProps, "textSize" | "color"> &
  ComponentPropsWithoutRef<"a">;

const StyledLink = styled.a<Props>`
  // Styling copied from https://github.com/gnosis/safe-react-components/blob/development/src/inputs/ButtonLink/index.tsx
  // because we need an <a> tag but SRC only provides a <button>

  background: transparent;
  border: none;
  text-decoration: underline;
  cursor: pointer;
  color: ${({ color }: Props) => theme.colors[color as string]};
  font-family: inherit;
  display: flex;
  align-items: center;

  :focus {
    outline: none;
  }

  padding: 0;

  p {
    text-transform: uppercase;
    font-size: 0.75em;
    font-weight: bold;
  }
`;

export const Link: React.FC<Props> = (props) => {
  const { children, ...rest } = props;

  return (
    <StyledLink {...rest} target="_blank" rel="noopener noreferrer">
      <Text size={props.textSize} color={rest.color}>
        {children}
      </Text>
    </StyledLink>
  );
};
