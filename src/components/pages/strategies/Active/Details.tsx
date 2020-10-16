import React, { memo, useCallback, useState } from "react";

import Strategy from "logic/strategy";
import { Box, ButtonGroup } from "@material-ui/core";
import { Button } from "components/basic/inputs/Button";

import { Props as SafeComponentButtonProps } from "@gnosis.pm/safe-react-components/dist/inputs/Button";

// I hate this
type OldPropsWithoutColor = Omit<SafeComponentButtonProps, "color">;
type SafeButtonProps = OldPropsWithoutColor & { color: string };

export interface Props {
  strategy: Strategy;
}

export const Details = memo(function Details({ strategy }: Props): JSX.Element {
  const [activeDetailScreen, setActiveDetailScreen] = useState(null);

  const makeTabChangeHandler = useCallback((tabName): (() => void) => {
    return () => {
      setActiveDetailScreen(tabName);
    };
  }, []);

  return (
    <Box>
      <ButtonGroup>
        <Button
          size="md"
          variant="contained"
          onClick={makeTabChangeHandler("strategy")}
          color={activeDetailScreen === "strategy" ? "primary" : "white"}
        >
          Strategy
        </Button>
        <Button
          size="md"
          variant="contained"
          onClick={makeTabChangeHandler("trades")}
          color={activeDetailScreen === "trades" ? "primary" : "white"}
        >
          Trades
        </Button>
        <Button
          size="md"
          variant="contained"
          onClick={makeTabChangeHandler("params")}
          color={activeDetailScreen === "params" ? "primary" : "white"}
        >
          Deployed Params.
        </Button>
      </ButtonGroup>
    </Box>
  );
});
