import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { ButtonGroup } from "@material-ui/core";

import { StrategyState } from "types";

import { Button } from "components/basic/inputs/Button";

import { WithdrawButton } from "./WithdrawButton";
import { TabNames } from ".";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

export type Props = {
  strategy: StrategyState;
  activeTab: TabNames;
  setActiveTab: (tabName: TabNames) => void;
};

export const Header = memo(function Header(props: Props): JSX.Element {
  const { strategy, activeTab, setActiveTab } = props;

  const makeTabChangeHandler = useCallback(
    (tabName: TabNames) => () => setActiveTab(tabName),
    [setActiveTab]
  );

  return (
    <Wrapper>
      <ButtonGroup>
        <Button
          size="md"
          variant="contained"
          onClick={makeTabChangeHandler("strategy")}
          color={activeTab === "strategy" ? "primary" : "white"}
        >
          Strategy
        </Button>
        <Button
          size="md"
          variant="contained"
          onClick={makeTabChangeHandler("trades")}
          color={activeTab === "trades" ? "primary" : "white"}
        >
          Trades
        </Button>
        <Button
          size="md"
          variant="contained"
          onClick={makeTabChangeHandler("params")}
          color={activeTab === "params" ? "primary" : "white"}
        >
          Deployed Params.
        </Button>
      </ButtonGroup>
      <WithdrawButton strategy={strategy} />
    </Wrapper>
  );
});
