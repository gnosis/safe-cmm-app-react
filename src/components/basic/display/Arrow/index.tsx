import React from "react";
import styled from "styled-components";
import { ThemeColors } from "theme";

const Wrapper = styled.div<Props>`
  width: 0;
  height: 0;

  ${({ size = "sm", direction = "up", color = "text", theme }) => `
  border-left: ${sizes[size]} solid transparent;
  border-right: ${sizes[size]} solid transparent;

  border-${direction === "up" ? "bottom" : "top"}: calc(${
    sizes[size]
  } * 1.4) solid ${theme.colors[color || "text"]};
  `}
`;

const sizes = {
  xs: "5px",
  sm: "10px",
  md: "15px",
  lg: "20px",
};

type Size = keyof typeof sizes;

export type Props = {
  direction?: "up" | "down";
  color?: ThemeColors;
  size?: Size;
  className?: string;
};

export function Arrow(props: Props): JSX.Element {
  return <Wrapper {...props} />;
}
