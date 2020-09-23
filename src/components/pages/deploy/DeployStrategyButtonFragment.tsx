import React, { memo } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";

import { Button } from "@gnosis.pm/safe-react-components";

import { isSubmittingAtom } from "./atoms";
import { isValidSelector } from "./selectors";

const StyledButton = styled(Button)`
  border-radius: 16px;
  font-weight: bold;
`;

function component(): JSX.Element {
  const isValid = useRecoilValue(isValidSelector);
  const isSubmitting = useRecoilValue(isSubmittingAtom);

  return (
    <StyledButton
      type="submit"
      size="lg"
      color="primary"
      variant="contained"
      disabled={!isValid || isSubmitting}
    >
      <span>Deploy Strategy</span>
    </StyledButton>
  );
}

export const DeployStrategyButtonFragment = memo(component);
