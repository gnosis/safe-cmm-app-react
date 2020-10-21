import React, { memo, useContext } from "react";
import styled from "styled-components";
import { range } from "lodash";

import { theme } from "theme";

import { BracketsViewContext } from "./viewer";

function buildBorder(color: string): string {
  return `2px solid ${color}`;
}

const Wrapper = styled.div<{ hasLeftBrackets?: boolean; isDeploy?: boolean }>`
  height: inherit;
  display: flex;

  & > * {
    width: 100%;
  }

  /* Default to left side color */
  background-color: ${theme.colors.backgroundLightGreen};

  .left:first-of-type {
    border-left: ${buildBorder(theme.colors.borderDarkGreen)};
  }

  .left {
    border-right: ${({ isDeploy }) =>
      buildBorder(
        theme.colors[isDeploy ? "borderLightGreen" : "borderDarkGreen"]
      )};

    ${({ isDeploy }) =>
      isDeploy
        ? ""
        : `
          &:hover {
            background-color: ${theme.colors.borderLightGreen};
          }`}
  }

  .left:last-of-type {
    border-right: ${buildBorder(theme.colors.borderDarkGreen)};
  }

  ${({ hasLeftBrackets }) =>
    hasLeftBrackets
      ? ""
      : `
  .right:first-of-type {
    border-left: ${buildBorder(theme.colors.borderDarkPurple)};
  }`}

  .right {
    background-color: ${theme.colors.backgroundLightPurple};

    border-right: ${({ isDeploy }) =>
      buildBorder(
        theme.colors[isDeploy ? "borderLightPurple" : "borderDarkPurple"]
      )};

    ${({ isDeploy }) =>
      isDeploy
        ? ""
        : `
          &:hover {
            background-color: ${theme.colors.borderLightPurple};
          }`}
  }

  .right:last-of-type {
    border-right: ${buildBorder(theme.colors.borderDarkPurple)};
  }
`;

export const Brackets = memo(function Brackets(): JSX.Element {
  const { totalBrackets, leftBrackets, rightBrackets, type } = useContext(
    BracketsViewContext
  );

  return (
    <Wrapper hasLeftBrackets={!!leftBrackets} isDeploy={type === "deploy"}>
      {range(
        !leftBrackets && !rightBrackets ? totalBrackets : leftBrackets
      ).map((id) => (
        <div className="left" key={id} />
      ))}
      {range(rightBrackets).map((id) => (
        <div className="right" key={id + leftBrackets} />
      ))}
    </Wrapper>
  );
});
