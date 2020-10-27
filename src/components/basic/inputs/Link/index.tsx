import React, { ComponentPropsWithoutRef, memo } from "react";
import styled from "styled-components";

import { Text } from "components/basic/display/Text";

import { theme } from "theme";

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

  :focus {
    outline: none;
  }

  padding: 0;

  p {
    text-transform: uppercase;
    font-weight: bold;
  }
`;

export const component: React.FC<Props> = (props) => {
  const { children, ...rest } = props;

  return (
    <StyledLink {...rest} target="_blank" rel="noopener noreferrer">
      <Text size={props.textSize} color={rest.color} as="span">
        {children}
      </Text>
    </StyledLink>
  );
};

export const Link = memo(component);
