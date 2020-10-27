import React, { memo, useCallback, useState, useContext } from "react";
import styled from "styled-components";
import { ButtonGroup } from "@material-ui/core";

import Strategy from "logic/strategy";
import { Button } from "components/basic/inputs/Button";

import { StrategyTab } from "./StrategyTab";
import { WithdrawButton } from "./WithdrawButton";
import { DeployedParamsTab } from "./DeployedParamsTab";

import useInterval from "@use-it/interval";
import {
  ContractInteractionContext,
  ContractInteractionContextProps,
} from "components/context/ContractInteractionProvider";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TabContents = styled.div`
  padding: 35px 0;
`;

export interface Props {
  strategy: Strategy;
}

type TabNames = "strategy" | "trades" | "params";

let isFetching = false;
export const Details = function Details({ strategy }: Props): JSX.Element {
  const [activeDetailScreen, setActiveDetailScreen] = useState<TabNames>(
    "strategy"
  );
  const [hotStrategy, setHotStrategy] = useState(strategy);

  const ctx = useContext(ContractInteractionContext);

  const updateHotStrategy = useCallback(
    async (ctx: ContractInteractionContextProps): Promise<void> => {
      if (isFetching) return;
      isFetching = true;
      console.log("updating a strategy");
      // im so sorry
      await strategy.fetchAllPossibleInfo(ctx);
      console.log(strategy);
      setHotStrategy(strategy);
      isFetching = false;
    },
    [strategy, setHotStrategy]
  );

  useInterval(() => {
    console.log("updating strategy selected in detail screen");
    updateHotStrategy(ctx);
  }, 10000);

  const makeTabChangeHandler = useCallback(
    (tabName: TabNames): (() => void) => {
      return () => {
        setActiveDetailScreen(tabName);
      };
    },
    []
  );
  console.log(hotStrategy);

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
        <WithdrawButton strategy={hotStrategy} />
      </Header>
      <TabContents>
        {activeDetailScreen === "strategy" && (
          <StrategyTab strategy={hotStrategy} />
        )}
        {activeDetailScreen === "params" && (
          <DeployedParamsTab strategy={hotStrategy} />
        )}
      </TabContents>
    </>
  );
};
