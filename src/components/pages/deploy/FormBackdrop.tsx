import React, { memo, useContext } from "react";
import { Backdrop, withStyles } from "@material-ui/core";
import { Loader } from "@gnosis.pm/safe-react-components";
import { useFormState } from "react-final-form";

import { ContractInteractionContext } from "components/context/ContractInteractionProvider";

const StyledBackdrop = withStyles(() => ({ root: { zIndex: 999 } }))(Backdrop);

export const FormBackdrop = memo(function FormBackdrop(): JSX.Element {
  const { submitting } = useFormState({ subscription: { submitting: true } });
  const { tokenListLoaded } = useContext(ContractInteractionContext);

  return (
    <StyledBackdrop open={submitting || !tokenListLoaded}>
      <Loader size="lg" color="primaryLight" />
    </StyledBackdrop>
  );
});
