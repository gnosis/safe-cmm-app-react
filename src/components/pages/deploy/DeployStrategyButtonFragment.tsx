import React, { memo, useContext } from "react";
import styled from "styled-components";

import { Button } from "@gnosis.pm/safe-react-components";

import { DeployPageContext } from "./viewer";

const StyledButton = styled(Button)`
  border-radius: 16px;
  font-weight: bold;
`;

function component(): JSX.Element {
  const { onSubmit, isSubmitting } = useContext(DeployPageContext);

  return (
    <StyledButton
      type="submit"
      size="lg"
      color="primary"
      variant="contained"
      disabled={!onSubmit || isSubmitting}
    >
      <span>Deploy Strategy</span>
    </StyledButton>
  );
}

export const DeployStrategyButtonFragment = memo(component);
