import React, { useCallback } from "react";

import { useHistory } from "react-router-dom";

import { Box } from "@material-ui/core";
import Heading from "components/Heading";
import { ButtonLink } from "@gnosis.pm/safe-react-components";

const Active = () => {
  const history = useHistory();
  const handleNavigateToDeploy = useCallback(() => {
    history.replace("/deploy");
  }, [history]);

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
