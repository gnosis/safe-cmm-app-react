import React, { memo } from "react";
import Decimal from "decimal.js";

import { Title } from "./Title";
import { Table } from "./Table";

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
  hoverId?: number;
  onHover?: (bracketId?: number) => void;
};

export const BracketsTable = memo(function BracketsTable(
  props: Props
): JSX.Element {
  const { brackets, type } = props;

  const isLeft = type === "left";
  return (
    <div>
      <Title isLeft={isLeft} bracketsCount={brackets.length} />
      <Table {...props} />
    </div>
  );
});
