import React, { memo } from "react";
import styled from "styled-components";

import { theme, ThemeTextSize } from "theme";

type WrapperProps = { size?: ThemeTextSize };

const Wrapper = styled.dl<WrapperProps>`
  font-family: ${theme.fonts.fontFamily};
  font-size: ${({ size }) => theme.text.size[size].fontSize};
  line-height: ${({ size }) => theme.text.size[size].lineHeight};

  dt:before {
    content: "";
    display: block;
  }

  dt,
  dd {
    display: inline;
  }

  dt {
    font-weight: bold;
  }

  dd {
    margin: 0 0 0 3px;
  }
`;

export type Props = { children: React.ReactNode } & WrapperProps;

export const DescriptionList = memo(function DescriptionList(
  props: Props
): JSX.Element {
  const { children, size = "md" } = props;

  return <Wrapper size={size}>{children}</Wrapper>;
});
