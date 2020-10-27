import React, { memo } from "react";
import styled from "styled-components";

import Strategy from "logic/strategy";
import { BracketsViewer } from "components/basic/display/BracketsView";

export type Props = {
  strategy: Strategy;
};

const Wrapper = styled.div``;

export const StrategyTab = memo(function StrategyTab(
  props: Props
): JSX.Element {
  const { strategy } = props;

  return (
    <Wrapper>
      <BracketsViewer
        type="strategy"
        baseTokenAddress={strategy.baseTokenAddress}
        quoteTokenAddress={strategy.quoteTokenAddress}
        lowestPrice={strategy.priceRange?.lower.toString()}
        highestPrice={strategy.priceRange?.upper.toString()}
        totalBrackets={strategy.brackets?.length}
      />
    </Wrapper>
  );
});
