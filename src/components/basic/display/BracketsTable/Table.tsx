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
  greyText?: boolean;
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
    color: ({ greyText }: CellProps) =>
      theme.colors[greyText ? "textGrey" : "text"],
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
  tokenAddress: string;
  brackets: BracketRowData[];
} & RowProps;

export const Table = memo(function Table(props: Props): JSX.Element {
  const { tokenAddress, brackets, type } = props;

  // Both token components are repeated often, reusing same instance
  const greyToken = (
    <TokenDisplay token={tokenAddress} size="md" color="textGrey" />
  );
  const blackToken = (
    <TokenDisplay token={tokenAddress} size="md" color="text" />
  );

  const total = brackets.reduce(
    (acc, bracket) => acc + Number(bracket.balance),
    0
  );

  return (
    <StyledTable>
      <TableHead>
        <StyledRow>
          <StyledCell greyText>Range</StyledCell>
          <StyledCell greyText>Balance</StyledCell>
        </StyledRow>
      </TableHead>
      <TableBody>
        {brackets.map((bracket, id) => (
          <StyledRow key={id} type={type}>
            <StyledCell greyText>
              {bracket.lowPrice} {greyToken} <br />
              {bracket.highPrice} {greyToken}
            </StyledCell>
            <StyledCell>
              {bracket.balance} {blackToken}
            </StyledCell>
          </StyledRow>
        ))}
      </TableBody>
      <TableFooter>
        <StyledRow>
          <StyledCell greyText>Total</StyledCell>
          <StyledCell>
            {total} {blackToken}
          </StyledCell>
        </StyledRow>
      </TableFooter>
    </StyledTable>
  );
});
