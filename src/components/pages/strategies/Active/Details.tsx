import React, { useCallback, useState } from "react";
import styled from "styled-components";
import { ButtonGroup } from "@material-ui/core";

import { Button } from "components/basic/inputs/Button";

import { StrategyTab } from "./StrategyTab";
import { WithdrawButton } from "./WithdrawButton";
import { DeployedParamsTab } from "./DeployedParamsTab";

import { StrategyState } from "types";

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
      <TabContents>
        {activeDetailScreen === "strategy" && (
          <StrategyTab strategy={strategy} />
        )}
        {activeDetailScreen === "params" && (
          <DeployedParamsTab strategy={strategy} />
        )}
      </TabContents>
    </>
  );
};
