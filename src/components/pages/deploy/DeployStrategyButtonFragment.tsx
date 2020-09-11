import React, { memo } from "react";
import styled from "styled-components";

import { Button } from "@gnosis.pm/safe-react-components";

const StyledButton = styled(Button)`
  border-radius: 16px;
  font-weight: bold;
`;

function component(): JSX.Element {
  return (
    <StyledButton type="submit" size="lg" color="primary" variant="contained">
      Deploy Strategy
    </StyledButton>
  );
}

export const DeployStrategyButtonFragment = memo(component);
