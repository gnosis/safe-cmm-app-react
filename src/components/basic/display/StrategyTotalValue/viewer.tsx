import Decimal from "decimal.js";
import React, { memo } from "react";
import styled from "styled-components";

import { DetailsTable } from "./DetailsTable";
import { TotalValue } from "./TotalValue";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 35px;
`;

export type Props = {
  totalValue?: Decimal;
  holdValue?: Decimal;
  roi?: Decimal;
  apy?: Decimal;
};

export const StrategyTotalValueViewer = memo(function StrategyTotalValueViewer(
  props: Props
): JSX.Element {
  const { totalValue, ...rest } = props;

  return (
    <Wrapper>
      <TotalValue value={totalValue} />
      <DetailsTable {...rest} />
    </Wrapper>
  );
});
