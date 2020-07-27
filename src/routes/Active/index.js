import React, { useCallback } from "react";

import { Box } from "@material-ui/core";
import Heading from "components/Heading";
import { ButtonLink } from "@gnosis.pm/safe-react-components";

const Active = ({ history }) => {
  const handleNavigateToDeploy = useCallback(() => {
    history.replace("/deploy");
  });

  return (
    <Box>
      <Heading
        title="Active Strategies"
        navigationItems={
          <ButtonLink onClick={handleNavigateToDeploy} color="primary">
            Deploy new Strategy
          </ButtonLink>
        }
      />
    </Box>
  );
};

export default Active;
