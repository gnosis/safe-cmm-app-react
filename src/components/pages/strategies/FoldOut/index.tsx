import React, { memo, useMemo, useState } from "react";
import styled from "styled-components";

import { StrategyState } from "types";

import { DeployedParams } from "components/basic/display/DeployedParams";
import { Text } from "components/basic/display/Text";

import { Header } from "./Header";

const TabContents = styled.div`
  padding: 35px 0;
`;

export type TabNames = "strategy" | "trades" | "params";

export type Props = {
  strategy: StrategyState;
  StrategyComponent: ({ strategy: StrategyState }) => JSX.Element;
};

export const FoldOut = memo(function FoldOut(props: Props): JSX.Element {
  const { strategy, StrategyComponent } = props;

  const [activeTab, setActiveTab] = useState<TabNames>("strategy");

  const contents = useMemo(() => {
    switch (activeTab) {
      case "strategy":
        return <StrategyComponent strategy={strategy} />;
      case "params":
        return <DeployedParams strategy={strategy} />;
      case "trades":
        return <Text>Feature not yet available.</Text>;
    }
  }, [activeTab, strategy]);

  return (
    <>
      <Header
        strategy={strategy}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <TabContents>{contents}</TabContents>
    </>
  );
});
