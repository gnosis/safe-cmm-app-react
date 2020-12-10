import React, { memo, useMemo } from "react";
import styled from "styled-components";
import { useFormState } from "react-final-form";

import { BracketsViewer } from "components/basic/display/BracketsView";

import { theme } from "theme";

import { getBracketValue } from "./DeployForm";
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

    const totalBrackets = Number(values.totalBrackets);
    // I know this is confusing, so let me explain:
    // Base token brackets correspond to the amount of brackets that will be funded with
    // base tokens, and the same goes for quote tokens.
    // The lower end of the brackets will be first funded with quote tokens, then the remainder
    // with base tokens.
    // Since we display the price from left (lower) to right (higher):
    // - quote will come on the left
    // - base will come on the right
    const rightBrackets = useMemo(
      () => getBracketValue(values.calculatedBrackets, "base"),
      [values.calculatedBrackets]
    );
    const leftBrackets = useMemo(
      () => getBracketValue(values.calculatedBrackets, "quote"),
      [values.calculatedBrackets]
    );

    return (
      <Wrapper>
        <BracketsViewer
          type="deploy"
          {...values}
          leftBrackets={leftBrackets}
          rightBrackets={rightBrackets}
          totalBrackets={totalBrackets}
        />
      </Wrapper>
    );
  }
);
