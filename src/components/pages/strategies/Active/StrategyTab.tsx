import React, { memo } from "react";
import styled from "styled-components";

import { BracketsViewer } from "components/basic/display/BracketsView";
import { StrategyState } from "types";

export type Props = {
  strategy: StrategyState;
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
        baseTokenAddress={strategy.baseToken.address}
        quoteTokenAddress={strategy.quoteToken.address}
        lowestPrice={strategy.priceRange?.lower.toString()}
        highestPrice={strategy.priceRange?.upper.toString()}
        totalBrackets={strategy.brackets?.length}
      />
    </Wrapper>
  );
});
