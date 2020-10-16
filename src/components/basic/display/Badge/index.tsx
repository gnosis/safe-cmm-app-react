import { Typography } from "@material-ui/core";
import React, { memo } from "react";

import styled from "styled-components";

interface StyledSpanProps {
  backgroundColor: string;
  textColor: string;
  dotColor?: string;
  dotBorderColor?: string;
}

const StyledSpan = styled.span<StyledSpanProps>`
  display: inline-block;
  width: 24px;
  text-align: center;
  position: relative;
  font-weight: 400 !important;
  border-radius: 4px;
  background-color: ${({ theme, backgroundColor }) =>
    backgroundColor || theme.colors.primary};
  color: ${({ theme, textColor }) => textColor || theme.colors.white};

  &.dot::before {
    position: absolute;
    content: "";
    top: -4px;
    right: -4px;
    border-radius: 100%;
    border: 1px solid ${({ dotBorderColor }) => dotBorderColor || "white"};
    width: 7px;
    height 7px;
    background-color: ${({ dotColor }) => dotColor || "#e8673d"}
  }
`;

export interface Props {
  children: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
  dotColor?: string;
  dotBorderColor?: string;
  hasDot?: boolean;
}

export const Badge = memo(function Badge({
  children,
  backgroundColor,
  textColor,
  hasDot,
  dotBorderColor,
  dotColor,
}: Props): JSX.Element {
  return (
    <StyledSpan
      className={hasDot ? "dot" : ""}
      backgroundColor={backgroundColor}
      dotColor={dotColor}
      dotBorderColor={dotBorderColor}
      textColor={textColor}
    >
      <Typography component="span">{children}</Typography>
    </StyledSpan>
  );
});
