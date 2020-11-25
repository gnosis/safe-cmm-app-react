import React, { memo, useCallback, useMemo, useState } from "react";
import styled from "styled-components";

import { GenericModal } from "@gnosis.pm/safe-react-components";

import { First } from "./First";
import { Second } from "./Second";
import { Third } from "./Third";
import { Last } from "./Last";
import { Stepper } from "./Stepper";
import { Footer } from "./Footer";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 400px;
  height: 300px;
  padding: 15px 30px;

  .title {
    margin-bottom: 20px;
  }
`;

export type Props = {
  closeModal: () => void;
  initialStep?: number;
};

export const Welcome = memo(function Welcome(props: Props): JSX.Element {
  const { closeModal, initialStep } = props;
  const [currentStep, setCurrentStep] = useState(initialStep || 1);

  const onNextStepFactory = useCallback(
    (step: number) => (): void => {
      if (step < 4) {
        setCurrentStep(step + 1);
      } else {
        closeModal();
      }
    },
    [closeModal]
  );

  const { body, footer } = useMemo((): {
    body: JSX.Element;
    footer: JSX.Element;
  } => {
    switch (currentStep) {
      case 2:
        return {
          body: <Second />,
          footer: (
            <Footer buttonText="Next" onNextClick={onNextStepFactory(2)} />
          ),
        };
      case 3:
        return {
          body: <Third />,
          footer: (
            <Footer buttonText="Next" onNextClick={onNextStepFactory(3)} />
          ),
        };
      case 4:
        return {
          body: <Last />,
          footer: (
            <Footer buttonText="Finish" onNextClick={onNextStepFactory(4)} />
          ),
        };
      case 1:
      default:
        return {
          body: <First />,
          footer: (
            <Footer buttonText="Start" onNextClick={onNextStepFactory(1)} />
          ),
        };
    }
  }, [currentStep, onNextStepFactory]);

  return (
    <GenericModal
      title="Welcome"
      body={
        <Wrapper>
          {body}
          <Stepper totalSteps={4} currentStep={currentStep} />
        </Wrapper>
      }
      footer={footer}
      onClose={closeModal}
    />
  );
});
