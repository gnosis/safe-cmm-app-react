import React from "react";
import styled from "styled-components";

import { Text as SRCText } from "@gnosis.pm/safe-react-components";
import { ThemeTextSize } from "@gnosis.pm/safe-react-components/dist/theme";

import { theme } from "theme";

type OverwrittenSize = { size?: ThemeTextSize | "xs" };

export type Props = Omit<React.ComponentProps<typeof SRCText>, "size"> &
  OverwrittenSize;

const ReStyledText = styled(SRCText)<OverwrittenSize>`
  font-size: ${({ size }) => `${theme.text.size[size].fontSize}`};
  line-height: ${({ size }) => `${theme.text.size[size].lineHeight}`};
`;

/**
 * Overwrites Safe React Components <Text/> to introduce on extra size: `xs`
 */
export const Text = (props: Props): React.ReactElement => {
  const { children, size = "sm", as, ...rest } = props;

  return (
    <ReStyledText {...rest} size={size} forwardedAs={as}>
      {children}
    </ReStyledText>
  );
};
