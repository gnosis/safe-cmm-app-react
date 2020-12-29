import React from "react";
import styled from "styled-components";

import { theme } from "theme";

import { Badge } from "components/basic/display/Badge";
import { Text } from "components/basic/display/Text";

export interface Props {
  label: string;
  active?: boolean;
  count?: number;
  hasDot?: boolean;
  activeBgColor?: string;
  inactiveBgColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
}

interface TabHeaderButtonProps {
  active?: boolean;
}

const Wrapper = styled.div<TabHeaderButtonProps>`
  text-decoration: none;
  display: flex;
  align-items: center;

  .button-text {
    font-weight: ${({ active }) => (active ? 600 : 400)};
    text-transform: none;
    font-family: ${theme.fonts.fontFamily};
    font-size: ${theme.text.size.xl};
    margin-right: 5px;
  }
`;

export const SafeStyleTabHeaderWithCounter = ({
  label,
  active,
  count = 0,
  hasDot,
  activeBgColor,
  inactiveBgColor,
  activeTextColor,
  inactiveTextColor,
}: Props): JSX.Element => {
  return (
    <Wrapper
      color={active ? "primary" : "placeHolder"}
      className={active ? "active" : ""}
      active={active}
    >
      <Text
        className="button-text"
        size="xl"
        color={active ? "primary" : "placeHolder"}
        as="span"
      >
        {label}
      </Text>
      <Badge
        backgroundColor={active ? activeBgColor : inactiveBgColor}
        textColor={active ? activeTextColor : inactiveTextColor}
        hasDot={hasDot}
      >
        {count}
      </Badge>
    </Wrapper>
  );
};
