/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo } from "react";
import styled from "styled-components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  withStyles,
} from "@material-ui/core";

import { Loader } from "@gnosis.pm/safe-react-components";

import { theme, ThemeTextSize } from "theme";

import { DisplayTrade } from "api/web3/trades";

import { formatSmart } from "utils/format";

import { Text } from "components/basic/display/Text";

import { Header } from "./Header";

const Wrapper = styled.div<{ center?: boolean }>`
  display: flex;
  flex-direction: column;
  ${({ center }) =>
    center
      ? `
  justify-items: center;
  align-items: center;
  `
      : ""}
`;

type CellProps = {
  strong?: boolean;
  textSize?: ThemeTextSize;
  type?: "sell" | "buy";
};

const StyledCell = withStyles({
  root: {
    fontFamily: theme.fonts.fontFamily,
    fontSize: ({ textSize = "sm" }: CellProps) =>
      theme.text.size[textSize].fontSize,
    lineHeight: ({ textSize = "sm" }: CellProps) =>
      theme.text.size[textSize].lineHeight,
    fontWeight: ({ strong }: CellProps) => (strong ? "bold" : "inherit"),
    color: ({ type }: CellProps) =>
      !type
        ? "inherit"
        : theme.colors[type === "buy" ? "roiApyPositive" : "roiApyNegative"],
    padding: "10px 16px",
    borderBottomWidth: "2px",
  },
  head: {
    padding: "16px",
  },
})(
  ({
    strong,
    textSize,
    type,
    ...rest
  }: React.ComponentProps<typeof TableCell> & CellProps) => (
    // This wrapper component is a work around to avoid the error:
    // "Warning: Received `false` for a non-boolean attribute `...`."
    // The issue arises when the prop is passed down MUI component
    // which doesn't know what it is.
    // This wrapper swallows it and passes down only known props.
    <TableCell {...rest} />
  )
);

const Dot = styled.div<{ type: "buy" | "sell" }>`
  display: inline-flex;
  align-items: center;

  &::before {
    content: "";
    border-style: solid;
    border-radius: 4px;
    border-width: 4px;
    border-color: ${({ type, theme }) =>
      theme.colors[type === "buy" ? "roiApyPositive" : "roiApyNegative"]};

    margin-right: 5px;
  }
`;

export type Props = {
  trades: DisplayTrade[];
  totalTrades: number;
  isLoading: boolean;
};

export const TradesView = memo(function Trades(props: Props): JSX.Element {
  const { trades, totalTrades, isLoading } = props;

  if (isLoading && trades.length === 0) {
    return (
      <Wrapper center>
        <Loader size="md" />
      </Wrapper>
    );
  }

  if (trades.length === 0) {
    return <Text size="2xl">No trades</Text>;
  }
  const now = Date.now();

  return (
    <Wrapper>
      <Header
        loaded={trades.length}
        total={totalTrades}
        isLoading={isLoading}
      />
      <Table>
        <TableHead>
          <TableRow>
            <StyledCell strong>TYPE</StyledCell>
            <StyledCell>TRADE</StyledCell>
            <StyledCell>PRICE</StyledCell>
            <StyledCell>DATE</StyledCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trades.map((trade, id) => (
            <TableRow key={id}>
              <StyledCell textSize="lg" type={trade.type} strong>
                <Dot type={trade.type}>
                  {trade.type?.replace(/^\w/, (l) => l.toUpperCase())}
                </Dot>
              </StyledCell>
              <StyledCell textSize="lg">
                {`${formatSmart(trade.baseTokenAmount)} ${
                  trade.baseTokenSymbol
                } for ${formatSmart(trade.quoteTokenAmount)} ${
                  trade.quoteTokenSymbol
                }`}
              </StyledCell>
              <StyledCell textSize="lg">
                {`1 ${trade.baseTokenSymbol} = ${formatSmart(trade.price)} ${
                  trade.quoteTokenSymbol
                }`}
              </StyledCell>
              <StyledCell textSize="lg">
                {trade.date.toLocaleString()}{" "}
                {trade.pendingUntil.getTime() > now && "*"}
              </StyledCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Wrapper>
  );
});
