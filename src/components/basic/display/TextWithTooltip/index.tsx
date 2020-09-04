import React, { memo } from "react";
import styled from "styled-components";

import {
  ThemeColors,
  ThemeTextSize,
} from "@gnosis.pm/safe-react-components/dist/theme";
import { Text, Icon } from "@gnosis.pm/safe-react-components";

import { Tooltip } from "components/basic/display/Tooltip";

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
  size: ThemeTextSize;
  color?: ThemeColors;
  className?: string;
  children: React.ReactElement | string;
}

const component: React.FC<Props> = (props) => {
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
};

export const TextWithTooltip = memo(component);
