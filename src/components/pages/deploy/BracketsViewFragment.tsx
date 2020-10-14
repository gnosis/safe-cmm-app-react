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
    const leftBrackets = useMemo(
      () => getBracketValue(values.calculatedBrackets, "base"),
      [values.calculatedBrackets]
    );
    const rightBrackets = useMemo(
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
