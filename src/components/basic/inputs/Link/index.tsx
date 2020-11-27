import React, { ComponentPropsWithoutRef, memo } from "react";
import styled from "styled-components";

import { Button } from "@gnosis.pm/safe-react-components";

import { Text } from "components/basic/display/Text";

import { theme } from "theme";

import { Props as ButtonLinkProps } from "components/basic/inputs/ButtonLink";

export type Props = Pick<ButtonLinkProps, "textSize" | "color"> &
  ComponentPropsWithoutRef<"a"> & { as?: "button" | "a" };

// Styling copied from https://github.com/gnosis/safe-react-components/blob/development/src/inputs/ButtonLink/index.tsx
// because we need an <a> tag but SRC only provides a <button>
const StyledLink = styled.a<Props>`
  background: transparent;
  border: none;
  text-decoration: underline;
  cursor: pointer;
  color: ${({ color }: Props) => theme.colors[color]};
  font-family: inherit;

  :focus {
    outline: none;
  }

  padding: 0;

  p {
    text-transform: uppercase;
    font-weight: bold;
  }

  & > button {
    width: 100%;
  }
`;

export const component: React.FC<Props> = (props) => {
  const { children, as, ...rest } = props;

  let buttonColor: React.ComponentProps<typeof Button>["color"] = "primary";
  if (rest.color === "error" || rest.color === "secondary") {
    buttonColor = rest.color;
  }

  return (
    <StyledLink {...rest} target="_blank" rel="noopener noreferrer">
      {as === "button" ? (
        <Button size="md" color={buttonColor}>
          {children}
        </Button>
      ) : (
        <Text size={props.textSize} color={rest.color} as="span">
          {children}
        </Text>
      )}
    </StyledLink>
  );
};

export const Link = memo(component);
