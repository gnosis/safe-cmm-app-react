import React from "react";
import styled from "styled-components";

import {
  ThemeColors,
  ThemeTextSize,
} from "@gnosis.pm/safe-react-components/dist/theme";
import { Text, Icon } from "@gnosis.pm/safe-react-components";

const Wrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;

  svg {
    padding-left: 0.25em;
  }
`;

export interface Props {
  text: string;
  tooltip: string;
  size: ThemeTextSize;
  color?: ThemeColors;
}

export const LabelWithTooltip = (props: Props): JSX.Element => {
  const { text, tooltip, size, color } = props;

  return (
    <Text size={size} strong color={color}>
      <Wrapper>
        {text}
        <Icon size="sm" type="question" tooltip={tooltip} />
      </Wrapper>
    </Text>
  );
};
