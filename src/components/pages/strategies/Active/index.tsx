import React, { memo } from "react";
import { Box } from "@material-ui/core";

import { Loader } from "@gnosis.pm/safe-react-components";

import { ActiveTable } from "./ActiveTable";
import { useRecoilValue } from "recoil";
import { strategiesOfStatusSelector } from "state/selectors/strategiesOfStatus";
import { strategiesLoadingState } from "state/atoms";

export const Active = memo(function Active(): JSX.Element {
  //const { strategies, status } = useWeb3Strategies();
  const strategies = useRecoilValue(strategiesOfStatusSelector("ACTIVE"));
  const strategyLoadingState = useRecoilValue(strategiesLoadingState);

  if (strategyLoadingState === "LOADING" && strategies.length === 0) {
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
