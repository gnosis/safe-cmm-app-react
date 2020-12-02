import { DeployedParams } from "components/basic/display/DeployedParams";
import { Text } from "components/basic/display/Text";
import React, { memo, useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { StrategyState } from "types";
import { ButtonGroup } from "@material-ui/core";

import { Button } from "components/basic/inputs/Button";
import { WithdrawButton } from "./WithdrawButton";

const Wrapper = styled.div``;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TabContents = styled.div`
  padding: 35px 0;
`;

type TabNames = "strategy" | "trades" | "params";

export type Props = {
  strategy: StrategyState;
  StrategyComponent: ({ strategy: StrategyState }) => JSX.Element;
};

export const FoldOut = memo(function FoldOut(props: Props): JSX.Element {
  const { strategy, StrategyComponent } = props;

  const [activeDetailScreen, setActiveDetailScreen] = useState<TabNames>(
    "strategy"
  );

  const makeTabChangeHandler = useCallback(
    (tabName: TabNames) => () => setActiveDetailScreen(tabName),
    []
  );

  const contents = useMemo(() => {
    switch (activeDetailScreen) {
      case "strategy":
        return <StrategyComponent strategy={strategy} />;
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
});
