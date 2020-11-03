import React, { memo } from "react";

import {
  Table as MUITable,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  withStyles,
} from "@material-ui/core";

import { theme } from "theme";

import { TokenDisplay } from "components/basic/display/TokenDisplay";

import { BracketRowData } from ".";

const StyledTable = withStyles({
  root: { borderCollapse: "separate", borderSpacing: "0 2px" },
})(MUITable);

type CellProps = {
  grey?: boolean;
};

const StyledCell = withStyles({
  root: {
    fontFamily: theme.fonts.fontFamily,
    fontSize: theme.text.size.sm.fontSize,
    lineHeight: theme.text.size.sm.lineHeight,
    fontWeight: "bold",
    letterSpacing: "0",
    textTransform: "uppercase",
    padding: "0 10px",
    borderBottom: "none",
    color: ({ grey }: CellProps) => theme.colors[grey ? "textGrey" : "text"],
  },
})(TableCell);

type RowProps = {
  type?: "left" | "right";
};

const StyledRow = withStyles({
  root: {
    height: "38px",
    padding: "0 10px",
    backgroundColor: ({ type }: RowProps) =>
      !type
        ? ""
        : theme.colors[
            type === "left" ? "backgroundLightGreen" : "backgroundLightPurple"
          ],
  },
  hover: ({ type }: RowProps) =>
    !type
      ? {}
      : {
          backgroundColor:
            theme.colors[
              type === "left" ? "borderLightGreen" : "borderLightPurple"
            ],
        },
  head: {
    // shorter header
    height: "24px",
  },
  footer: {
    // footer background color
    backgroundColor: theme.colors.backgroundSideBar,
  },
})(TableRow);

export type Props = {
  baseTokenAddress: string;
  quoteTokenAddress: string;
  brackets: BracketRowData[];
} & RowProps;

export const Table = memo(function Table(props: Props): JSX.Element {
  const { baseTokenAddress, quoteTokenAddress, brackets, type } = props;

  // Token components are repeated often, reusing same instance
  const priceTokenDisplay = (
    <TokenDisplay token={baseTokenAddress} size="md" color="textGrey" />
  );
  const baseTokenDisplay = (
    <TokenDisplay token={baseTokenAddress} size="md" color="text" />
  );
  const quoteTokenDisplay = (
    <TokenDisplay token={quoteTokenAddress} size="md" color="text" />
  );

  const [totalBase, totalQuote] = brackets.reduce(
    (acc, bracket) => [
      acc[0] + Number(bracket.balanceBase),
      acc[1] + Number(bracket.balanceQuote),
    ],
    [0, 0]
  );

  return (
    <StyledTable>
      <TableHead>
        <StyledRow>
          <StyledCell grey>Range</StyledCell>
          <StyledCell grey colSpan={2}>
            Balance
          </StyledCell>
        </StyledRow>
      </TableHead>
      <TableBody>
        {brackets.map((bracket, id) => (
          <StyledRow key={id} type={type}>
            <StyledCell grey>
              {bracket.lowPrice.toFixed(4)} {priceTokenDisplay} <br />
              {bracket.highPrice.toFixed(4)} {priceTokenDisplay}
            </StyledCell>
            <StyledCell>
              {bracket.balanceBase} {baseTokenDisplay}
            </StyledCell>
            <StyledCell>
              {bracket.balanceQuote} {quoteTokenDisplay}
            </StyledCell>
          </StyledRow>
        ))}
      </TableBody>
      <TableFooter>
        <StyledRow>
          <StyledCell grey>Total</StyledCell>
          <StyledCell>
            {totalBase} {baseTokenDisplay}
          </StyledCell>
          <StyledCell>
            {totalQuote} {quoteTokenDisplay}
          </StyledCell>
        </StyledRow>
      </TableFooter>
    </StyledTable>
  );
});
