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

  &:hover {
    cursor: pointer;
  }
`;

export type Props = {
  totalSteps: number;
  currentStep: number;
  setCurrentStep: (stepId: number) => void;
};

export const Stepper = memo(function Stepper(props: Props): JSX.Element {
  const { totalSteps, currentStep, setCurrentStep } = props;

  return (
    <Wrapper>
      {range(1, totalSteps + 1).map((id) => (
        <Dot
          key={id}
          active={id === currentStep}
          onClick={() => setCurrentStep(id)}
        />
      ))}
    </Wrapper>
  );
});
