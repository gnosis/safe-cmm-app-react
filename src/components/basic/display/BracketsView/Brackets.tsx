import React, { memo, useContext } from "react";
import styled from "styled-components";
import { range } from "lodash";

import { BracketsViewContext } from "./viewer";

// TODO: move to const? theme?
const LEFT_BACKGROUND_COLOR = "rgba(0, 156, 180, 0.1)";
const RIGHT_BACKGROUND_COLOR = "rgba(128, 94, 255, 0.1)";
const LEFT_BORDER_LIGHT = "2px solid rgba(0, 156, 180, 0.2)";
const LEFT_BORDER_THICK = "2px solid #009cb4";
const RIGHT_BORDER_LIGHT = "2px solid rgba(128, 94, 255, 0.2)";
const RIGHT_BORDER_THICK = "2px solid #805eff";

const Wrapper = styled.div<{ hasLeftBrackets?: boolean }>`
  height: inherit;
  display: flex;

  & > * {
    width: 100%;
  }

  /* Default to left side color */
  background-color: ${LEFT_BACKGROUND_COLOR};

  .left:first-of-type {
    border-left: ${LEFT_BORDER_THICK};
  }

  .left {
    border-right: ${LEFT_BORDER_LIGHT};
  }

  .left:last-of-type {
    border-right: ${LEFT_BORDER_THICK};
  }

  ${({ hasLeftBrackets }) =>
    hasLeftBrackets
      ? ""
      : `
  .right:first-of-type {
    border-left: ${RIGHT_BORDER_THICK};
  }`}

  .right {
    background-color: ${RIGHT_BACKGROUND_COLOR};

    border-right: ${RIGHT_BORDER_LIGHT};
  }

  .right:last-of-type {
    border-right: ${RIGHT_BORDER_THICK};
  }
`;

export const Brackets = memo(function Brackets(): JSX.Element {
  const { totalBrackets, leftBrackets, rightBrackets } = useContext(
    BracketsViewContext
  );

  return (
    <Wrapper hasLeftBrackets={!!leftBrackets}>
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
