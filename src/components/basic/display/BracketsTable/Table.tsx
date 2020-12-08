import React, { memo, useCallback } from "react";

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

import { ZERO_DECIMAL } from "utils/constants";
import { formatSmart } from "utils/format";

import { TokenDisplay } from "components/basic/display/TokenDisplay";

import { Props as ParentProps } from ".";

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
    padding: "0 10px",
    borderBottom: "none",
    color: ({ grey }: CellProps) => theme.colors[grey ? "textGrey" : "text"],
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
})(({ grey, ...rest }: React.ComponentProps<typeof TableCell> & CellProps) => (
  // This wrapper component is a work around to avoid the error:
  // "Warning: Received `false` for a non-boolean attribute `grey`."
  // The issue arises when the prop `grey` is passed down MUI component
  // which doesn't know what `grey` is.
  // This wrapper swallows it and passes down only known props.
  <TableCell {...rest} />
));

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

export type Props = ParentProps & RowProps;

export const Table = memo(function Table(props: Props): JSX.Element {
  const {
    baseTokenAddress,
    quoteTokenAddress,
    brackets,
    type,
    hoverId,
    onHover,
  } = props;

  // Token components are repeated often, reusing same instance
  const priceTokenDisplay = (
    <TokenDisplay token={quoteTokenAddress} size="md" color="textGrey" />
  );
  const baseTokenDisplay = (
    <TokenDisplay token={baseTokenAddress} size="md" color="text" />
  );
  const quoteTokenDisplay = (
    <TokenDisplay token={quoteTokenAddress} size="md" color="text" />
  );

  const [totalBase, totalQuote] = brackets.reduce(
    (acc, bracket) => [
      acc[0].add(bracket.balanceBase),
      acc[1].add(bracket.balanceQuote),
    ],
    [ZERO_DECIMAL, ZERO_DECIMAL]
  );

  const onMouseLeave = useCallback((): void => onHover && onHover(), [onHover]);

  return (
    <StyledTable>
      <TableHead>
        <StyledRow>
          <StyledCell grey>RANGE</StyledCell>
          <StyledCell grey colSpan={2}>
            BALANCE
          </StyledCell>
        </StyledRow>
      </TableHead>
      <TableBody>
        {brackets.map((bracket, id) => (
          <StyledRow
            key={id}
            type={type}
            onMouseEnter={() => onHover && onHover(id)}
            onMouseLeave={onMouseLeave}
            hover={hoverId === id}
          >
            <StyledCell grey>
              {formatSmart(bracket.lowPrice)} {priceTokenDisplay} <br />
              {formatSmart(bracket.highPrice)} {priceTokenDisplay}
            </StyledCell>
            <StyledCell>
              {formatSmart(bracket.balanceBase)} {baseTokenDisplay}
            </StyledCell>
            <StyledCell>
              {formatSmart(bracket.balanceQuote)} {quoteTokenDisplay}
            </StyledCell>
          </StyledRow>
        ))}
      </TableBody>
      <TableFooter>
        <StyledRow>
          <StyledCell grey>TOTAL</StyledCell>
          <StyledCell>
            {formatSmart(totalBase)} {baseTokenDisplay}
          </StyledCell>
          <StyledCell>
            {formatSmart(totalQuote)} {quoteTokenDisplay}
          </StyledCell>
        </StyledRow>
      </TableFooter>
    </StyledTable>
  );
});
