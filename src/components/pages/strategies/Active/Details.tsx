import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { ButtonGroup } from "@material-ui/core";

import { Button } from "components/basic/inputs/Button";

import { StrategyTab } from "./StrategyTab";
import { WithdrawButton } from "./WithdrawButton";

import { StrategyState } from "types";
import { Text } from "components/basic/display/Text";
import { DeployedParams } from "components/basic/display/DeployedParams";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TabContents = styled.div`
  padding: 35px 0;
`;

export interface Props {
  strategy: StrategyState;
}

type TabNames = "strategy" | "trades" | "params";

export const Details = function Details({ strategy }: Props): JSX.Element {
  const [activeDetailScreen, setActiveDetailScreen] = useState<TabNames>(
    "strategy"
  );

  const makeTabChangeHandler = useCallback(
    (tabName: TabNames): (() => void) => {
      return () => {
        setActiveDetailScreen(tabName);
      };
    },
    []
  );

  const contents = useMemo(() => {
    switch (activeDetailScreen) {
      case "strategy":
        return <StrategyTab strategy={strategy} />;
      case "params":
        return <DeployedParams strategy={strategy} />;
      case "trades":
        return <Text>Feature not yet available.</Text>;
    }
  }, [activeDetailScreen, strategy]);

  return (
    <>
      <Header>
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
        <WithdrawButton strategy={strategy} />
      </Header>
      <TabContents>{contents}</TabContents>
    </>
  );
};
