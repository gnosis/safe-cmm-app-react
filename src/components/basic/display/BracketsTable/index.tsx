import React, { memo } from "react";
import styled from "styled-components";

import { Title } from "./Title";
import { Table } from "./Table";

// TODO: maybe not needed
const Wrapper = styled.div``;

export type BracketRowData = {
  lowPrice: string; //TODO: BN or string
  highPrice: string;
  balance: string;
};

export type Props = {
  tokenAddress: string;
  brackets: BracketRowData[];
  type: "left" | "right";
};

export const BracketsTable = memo(function BracketsTable(
  props: Props
): JSX.Element {
  const { tokenAddress, brackets, type } = props;

  return (
    <Wrapper>
      <Title
        tokenAddress={tokenAddress}
        isLeft={type === "left"}
        bracketsCount={brackets.length}
      />
      <Table tokenAddress={tokenAddress} brackets={brackets} type={type} />
    </Wrapper>
  );
});
