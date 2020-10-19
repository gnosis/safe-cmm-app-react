import { Loader } from "@gnosis.pm/safe-react-components";
import { Box } from "@material-ui/core";
import useWeb3Strategies from "hooks/useWeb3Strategies";
import React, { memo } from "react";

import { ActiveTable } from "./ActiveTable";

export const Active = memo(function Active(): JSX.Element {
  const { strategies, status } = useWeb3Strategies();

  if (status === "LOADING") {
    return (
      <Box>
        <Loader size="lg" />
      </Box>
    );
  }

  if (status === "ERROR") {
    return <Box>Sorry, something went wrong.</Box>;
  }

  return <ActiveTable strategies={strategies} />;
});