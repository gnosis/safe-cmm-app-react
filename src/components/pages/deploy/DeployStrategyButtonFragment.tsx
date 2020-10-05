import React, { memo } from "react";
import styled from "styled-components";

import { Button } from "@gnosis.pm/safe-react-components";

import { useFormState } from "react-final-form";

const StyledButton = styled(Button)`
  border-radius: 16px;
  font-weight: bold;
`;

function UDeployStrategyButtonFragment(): JSX.Element {
  const { invalid, pristine, submitting } = useFormState({
    subscription: { invalid: true, pristine: true, submitting: true },
  });

  return (
    <StyledButton
      type="submit"
      size="lg"
      color="primary"
      variant="contained"
      disabled={invalid || pristine || submitting}
    >
      <span>Deploy Strategy</span>
    </StyledButton>
  );
}

export const DeployStrategyButtonFragment = memo(UDeployStrategyButtonFragment);
