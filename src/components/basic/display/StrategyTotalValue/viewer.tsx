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

export type LoadingValue = {
  value?: Decimal;
  isLoading?: boolean;
};

export type Props = {
  totalValue?: LoadingValue;
  holdValue?: LoadingValue;
  roi?: LoadingValue;
  apr?: LoadingValue;
};

export const StrategyTotalValueViewer = memo(function StrategyTotalValueViewer(
  props: Props
): JSX.Element {
  const { totalValue, ...rest } = props;

  return (
    <Wrapper>
      <TotalValue {...totalValue} />
      <DetailsTable {...rest} />
    </Wrapper>
  );
});
