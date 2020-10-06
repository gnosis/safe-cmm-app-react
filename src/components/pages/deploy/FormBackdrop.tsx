import React, { memo } from "react";
import { Backdrop, withStyles } from "@material-ui/core";
import { Loader } from "@gnosis.pm/safe-react-components";
import { useFormState } from "react-final-form";

const StyledBackdrop = withStyles(() => ({ root: { zIndex: 999 } }))(Backdrop);

export const FormBackdrop = memo(function FormBackdrop(): JSX.Element {
  const { submitting } = useFormState({ subscription: { submitting: true } });

  return (
    <StyledBackdrop open={submitting}>
      <Loader size="lg" color="primaryLight" />
    </StyledBackdrop>
  );
});