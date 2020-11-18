import React from "react";
import styled from "styled-components";

import { Text as SRCText } from "@gnosis.pm/safe-react-components";

import { ThemeColors, ThemeTextSize } from "theme";

type Overwrites = { size?: ThemeTextSize; color?: ThemeColors };

export type Props = Omit<
  React.ComponentProps<typeof SRCText>,
  "size" | "color"
> &
  Overwrites;

const ReStyledText = styled(SRCText)<Overwrites>`
  font-size: ${({ size, theme }) =>
    `${theme.text.size[size || "md"].fontSize}`};
  line-height: ${({ size, theme }) =>
    `${theme.text.size[size || "md"].lineHeight}`};
  color: ${({ color, theme }) => theme.colors[color || "text"]};
`;

/**
 * Overwrites Safe React Components <Text/> to introduce on extra size: `xs`
 */
export const Text = (props: Props): React.ReactElement => {
  const { children, as, size = "md", ...rest } = props;

  return (
    <ReStyledText {...rest} size={size} forwardedAs={as}>
      {children}
    </ReStyledText>
  );
};
