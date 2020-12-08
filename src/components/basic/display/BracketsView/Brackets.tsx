import React, { memo, useCallback, useContext } from "react";
import styled from "styled-components";

import { theme } from "theme";

import { BracketsViewContext } from "./viewer";

function buildBorder(color: string): string {
  return `2px solid ${color}`;
}

const Wrapper = styled.div<{ hasLeftBrackets?: boolean }>`
  height: inherit;
  display: flex;

  .left:first-of-type {
    border-left: ${buildBorder(theme.colors.borderDarkGreen)};
  }

  .left {
    background-color: ${theme.colors.backgroundLightGreen};

    border-right: ${buildBorder(theme.colors.borderDarkGreen)};

    &.deploy {
      border-right: ${buildBorder(theme.colors.borderLightGreen)};
    }

    &:not(.deploy).hover,
    &:not(.deploy):hover {
      background-color: ${theme.colors.borderLightGreen};
    }
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

    border-right: ${buildBorder(theme.colors.borderDarkPurple)};

    &.deploy {
      border-right: ${buildBorder(theme.colors.borderLightPurple)};
    }

    &:not(.deploy).hover,
    &:not(.deploy):hover {
      background-color: ${theme.colors.borderLightPurple};
    }
  }

  .right:last-of-type {
    border-right: ${buildBorder(theme.colors.borderDarkPurple)};
  }
`;

const Bracket = styled.div<{
  width: number;
}>`
  width: ${({ width }) => width}%;
`;

export const Brackets = memo(function Brackets(): JSX.Element {
  const { bracketsSizes, leftBrackets, type, hoverId, onHover } = useContext(
    BracketsViewContext
  );

  const onMouseLeave = useCallback((): void => onHover && onHover(), [onHover]);

  const buildClasses = useCallback(
    (id: number): string => {
      const classes = [];

      classes.push(id < leftBrackets ? "left" : "right");
      hoverId === id && classes.push("hover");
      type === "deploy" && classes.push("deploy");

      return classes.join(" ");
    },
    [hoverId, leftBrackets, type]
  );

  return (
    <Wrapper hasLeftBrackets={leftBrackets > 0}>
      {bracketsSizes.map((size, id) => (
        <Bracket
          key={id}
          width={size}
          className={buildClasses(id)}
          onMouseEnter={() => onHover && onHover(id)}
          onMouseLeave={onMouseLeave}
        />
      ))}
    </Wrapper>
  );
});
