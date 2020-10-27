import React from "react";
import styled from "styled-components";

import { Button as SRCButton } from "@gnosis.pm/safe-react-components";

// Remove this file when the safe-components team fixes:
// - color prop only accepts primary, secondary and error when more colors are available

const StyledButton = styled(SRCButton)`
  .MuiButton-label {
    color: ${({ color }) => (color === "white" ? "black" : "white")};
  }
`;

export const Button = (props) => {
  return <StyledButton {...props} />;
};
