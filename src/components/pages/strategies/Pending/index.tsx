import React, { memo } from "react";
import { Box } from "@material-ui/core";

import { Loader } from "@gnosis.pm/safe-react-components";

import { PendingTable } from "./PendingTable";
import { useRecoilValue } from "recoil";
import { strategiesOfStatusSelector } from "state/selectors/strategiesOfStatus";
import { strategiesLoadingState } from "state/atoms";

export const Pending = memo(function Pending(): JSX.Element {
  const strategies = useRecoilValue(strategiesOfStatusSelector("PENDING"));
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

  return <PendingTable strategies={strategies} />;
});
