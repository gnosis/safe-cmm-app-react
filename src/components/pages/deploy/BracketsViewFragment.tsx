import React, { memo, useMemo } from "react";
import styled from "styled-components";
import { useFormState } from "react-final-form";

import { BracketsViewer } from "components/basic/display/BracketsView";

import { theme } from "theme";

import { DeployFormValues } from "./types";

const Wrapper = styled.div`
  width: 450px;
  heigh: 115px;

  background-color: ${theme.colors.backgroundSideBar};
  border-radius: 16px;

  & > * {
    padding: 17px 15px 10px;
  }
`;

export const BracketsViewFragment = memo(
  function BracketsViewFragment(): JSX.Element {
    const { values } = useFormState<DeployFormValues>();

    // I know this is confusing, so let me explain:
    // Base token brackets correspond to the amount of brackets that will be funded with
    // base tokens, and the same goes for quote tokens.
    // The lower end of the brackets will be first funded with quote tokens, then the remainder
    // with base tokens.
    // Since we display the price from left (lower) to right (higher):
    // - quote will come on the left
    // - base will come on the right
    const rightBrackets = useMemo(() => +values.baseTokenBrackets, [
      values.baseTokenBrackets,
    ]);
    const leftBrackets = useMemo(() => +values.quoteTokenBrackets, [
      values.quoteTokenBrackets,
    ]);
    const bracketsSizes = useMemo(
      () => values.bracketsSizes?.split("|").map(Number) || [100],
      [values.bracketsSizes]
    );

    return (
      <Wrapper>
        <BracketsViewer
          type="deploy"
          {...values}
          leftBrackets={leftBrackets}
          rightBrackets={rightBrackets}
          bracketsSizes={bracketsSizes}
        />
      </Wrapper>
    );
  }
);
