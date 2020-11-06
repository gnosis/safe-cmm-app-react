import React, { memo } from "react";
import styled from "styled-components";

import { Icon } from "@gnosis.pm/safe-react-components";

import { ThemeColors, ThemeTextSize } from "theme";

import { Tooltip } from "components/basic/display/Tooltip";
import { Text } from "components/basic/display/Text";

const Wrapper = styled.span`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;

  svg {
    padding-left: 0.25em;
  }
`;

export interface Props {
  tooltip: string;
  size?: ThemeTextSize;
  color?: ThemeColors;
  className?: string;
  children: React.ReactElement | string;
}

export const TextWithTooltip = memo(function TextWithTooltip(
  props: Props
): JSX.Element {
  const { children, tooltip, size, color, className } = props;

  return (
    <Wrapper className={className}>
      <Text size={size} strong color={color} as="span">
        {children}
      </Text>
      <Tooltip title={tooltip}>
        <Icon size="sm" type="question" />
      </Tooltip>
    </Wrapper>
  );
});
