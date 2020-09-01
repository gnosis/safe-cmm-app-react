import React from "react";
import styled from "styled-components";

import {
  ThemeColors,
  ThemeTextSize,
} from "@gnosis.pm/safe-react-components/dist/theme";
import { Text, Icon } from "@gnosis.pm/safe-react-components";

import { Tooltip } from "components/basic/display/Tooltip";

const Wrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;

  svg {
    padding-left: 0.25em;
  }
`;

export interface Props {
  text: string | React.ReactNode;
  tooltip: string;
  size: ThemeTextSize;
  color?: ThemeColors;
  className?: string;
}

export const TextWithTooltip = (props: Props): JSX.Element => {
  const { text, tooltip, size, color, className } = props;

  return (
    <Wrapper className={className}>
      <Text size={size} strong color={color}>
        {text}
      </Text>
      <Tooltip title={tooltip}>
        <span>
          {/* Needs the extra <span> wrap because... it's disabled?
            https://material-ui.com/components/tooltips/#disabled-elements
            Not sure, but doesn't work without it
          */}
          <Icon size="sm" type="question" />
        </span>
      </Tooltip>
    </Wrapper>
  );
};
