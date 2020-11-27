import { range } from "lodash";
import React, { memo } from "react";
import styled from "styled-components";
import { theme } from "theme";

const Wrapper = styled.div`
  display: flex;
  margin-top: auto;
`;

const Dot = styled.div<{ active?: boolean }>`
  height: 10px;
  width: 10px;
  border-radius: 5px;
  background-color: ${({ active }) =>
    theme.colors[active ? "primary" : "backgroundBadgeGray"]};
  margin: 0 7px;
`;

export type Props = { totalSteps: number; currentStep: number };

export const Stepper = memo(function Stepper(props: Props): JSX.Element {
  const { totalSteps, currentStep } = props;

  return (
    <Wrapper>
      {range(totalSteps).map((id) => (
        <Dot key={id} active={id + 1 === currentStep} />
      ))}
    </Wrapper>
  );
});
