import React, { memo, useCallback } from "react";

import styled from "styled-components";

import { ButtonLink } from "@gnosis.pm/safe-react-components";
import { Badge } from "components/basic/display/Badge";

interface TabHeaderButtonProps {
  active?: boolean;
}

const TabHeaderButton = styled(ButtonLink)<TabHeaderButtonProps>`
  text-decoration: none;

  .button-text {
    font-weight: ${({ active }) => (active ? 600 : 400)};
  }
`;

export interface Props {
  children?: React.ReactNode;
  active?: boolean;
  name?: string;
  onClick?: (SyntheticEvent) => void;
  count?: number;
  hasDot?: boolean;
  activeBgColor?: string;
  inactiveBgColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
}

export const TabHeaderWithCounter = memo(function TabHeader({
  children,
  active,
  name,
  onClick,
  count = 0,
  hasDot,
  activeBgColor,
  inactiveBgColor,
  activeTextColor,
  inactiveTextColor,
}: Props): JSX.Element {
  const handleClick = useCallback(() => {
    if (onClick) onClick(name);
  }, [onClick, name]);

  return (
    <TabHeaderButton
      textSize="xl"
      onClick={handleClick}
      color={active ? "primary" : "placeHolder"}
      className={active ? "active" : ""}
      active={active}
    >
      <span className="button-text">{children}&nbsp;</span>
      <Badge
        backgroundColor={active ? activeBgColor : inactiveBgColor}
        textColor={active ? activeTextColor : inactiveTextColor}
        hasDot={hasDot}
      >
        {count}
      </Badge>
    </TabHeaderButton>
  );
});
