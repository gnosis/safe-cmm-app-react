import React, { memo } from "react";
import { withStyles } from "@material-ui/core";

import { Button } from "@gnosis.pm/safe-react-components";

import { useFormState } from "react-final-form";

const StyledButton = withStyles({
  root: { borderRadius: "16px", fontWeight: "bold" },
})(Button);

export const DeployStrategyButtonFragment = memo(
  function DeployStrategyButtonFragment(): JSX.Element {
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
);
