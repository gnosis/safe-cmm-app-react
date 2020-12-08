import React, { memo, useCallback, useContext } from "react";
import styled from "styled-components";

import { theme } from "theme";

import { BracketsViewContext } from "./viewer";

function buildBorder(color: string): string {
  return `2px solid ${color}`;
}

const Wrapper = styled.div`
  height: inherit;
  display: flex;
`;

const Bracket = styled.div<{
  type: "left" | "right";
  width: number;
  hasLeftBrackets?: boolean;
}>`
  width: ${({ width }) => width}%;

  ${({ type, hasLeftBrackets }) => {
    const colorSuffix = type === "left" ? "Green" : "Purple";
    const firstOfType =
      (type === "left" || !hasLeftBrackets) &&
      `&:first-of-type {
            border-left: ${buildBorder(
              theme.colors[`borderDark${colorSuffix}`]
            )};
          }`;

    return `
      ${firstOfType || ""}

      background-color: ${theme.colors[`backgroundLight${colorSuffix}`]};
  
      border-right: ${buildBorder(theme.colors[`borderDark${colorSuffix}`])};
  
      &.deploy {
        border-right: ${buildBorder(theme.colors[`borderLight${colorSuffix}`])};
      }
  
      &:not(.deploy).hover,
      &:not(.deploy):hover {
        background-color: ${theme.colors[`borderLight${colorSuffix}`]};
      }
    }
  
    &:last-of-type {
      border-right: ${buildBorder(theme.colors[`borderDark${colorSuffix}`])};
    }
    `;
  }}
`;

export const Brackets = memo(function Brackets(): JSX.Element {
  const { bracketsSizes, leftBrackets, type, hoverId, onHover } = useContext(
    BracketsViewContext
  );

  const onMouseLeave = useCallback((): void => onHover && onHover(), [onHover]);

  const buildClasses = useCallback(
    (id: number): string => {
      const classes = [];

      hoverId === id && classes.push("hover");
      type === "deploy" && classes.push("deploy");

      return classes.join(" ");
    },
    [hoverId, type]
  );

  return (
    <Wrapper>
      {bracketsSizes.map((size, id) => (
        <Bracket
          key={id}
          width={size}
          hasLeftBrackets={leftBrackets > 0}
          type={id < leftBrackets ? "left" : "right"}
          className={buildClasses(id)}
          onMouseEnter={() => onHover && onHover(id)}
          onMouseLeave={onMouseLeave}
        />
      ))}
    </Wrapper>
  );
});
