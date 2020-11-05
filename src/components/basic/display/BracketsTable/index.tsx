import React, { memo } from "react";
import styled from "styled-components";
import Decimal from "decimal.js";

import { Title } from "./Title";
import { Table } from "./Table";

// TODO: maybe not needed
const Wrapper = styled.div``;

export type BracketRowData = {
  lowPrice: Decimal;
  highPrice: Decimal;
  balanceBase: Decimal;
  balanceQuote: Decimal;
};

export type Props = {
  baseTokenAddress: string;
  quoteTokenAddress: string;
  brackets: BracketRowData[];
  type: "left" | "right";
};

export const BracketsTable = memo(function BracketsTable(
  props: Props
): JSX.Element {
  const { baseTokenAddress, quoteTokenAddress, brackets, type } = props;

  const isLeft = type === "left";
  return (
    <Wrapper>
      <Title
        tokenAddress={isLeft ? baseTokenAddress : quoteTokenAddress}
        isLeft={isLeft}
        bracketsCount={brackets.length}
      />
      <Table {...props} />
    </Wrapper>
  );
});
