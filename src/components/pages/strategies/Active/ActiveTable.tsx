import React, { memo, useState, useCallback } from "react";
import styled from "styled-components";

import { formatSmart } from "@gnosis.pm/dex-js";

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@material-ui/core";
import Strategy from "logic/strategy";

import ChevronDown from "@material-ui/icons/KeyboardArrowDown";
import ChevronUp from "@material-ui/icons/KeyboardArrowUp";
import { Details } from "./Details";

const HideableTableRow = styled(TableRow)`
  &.hide {
    display: none;
  }
`;

const StyledTableHeader = styled(TableHead)`
  th {
    text-transform: uppercase;
    font-weight: 400;
  }
`;

const StyledTableContainer = styled(TableContainer)`
  width: 100%;
`;

export interface Props {
  strategies: Strategy[];
}

export const ActiveTable = memo(function ActiveTable({
  strategies,
}: Props): JSX.Element {
  const [foldOutStrategy, setFoldOutStrategy] = useState(null);

  const makeStrategyFoldoutHandler = useCallback((strategy: Strategy) => {
    return () => {
      setFoldOutStrategy((currFoldoutTxHash: string) => {
        if (currFoldoutTxHash === strategy.transactionHash) {
          return null;
        }
        return strategy.transactionHash;
      });
    };
  }, []);

  return (
    <StyledTableContainer>
      <Table>
        <StyledTableHeader>
          <TableRow>
            <TableCell>Deployed</TableCell>
            <TableCell>Token Pair</TableCell>
            <TableCell>Brackets</TableCell>
            <TableCell>Token A Balance</TableCell>
            <TableCell>Token B Balance</TableCell>
            <TableCell>ROI</TableCell>
            <TableCell>APY</TableCell>
            <TableCell />
            {/* status */}
            <TableCell />
            {/* expand */}
          </TableRow>
        </StyledTableHeader>
        <TableBody>
          {strategies.map((strategy) => (
            <>
              <TableRow key={strategy.transactionHash}>
                <TableCell>{strategy.created.toLocaleString()}</TableCell>
                <TableCell>
                  {strategy.quoteTokenDetails && strategy.baseTokenDetails
                    ? `${strategy.quoteTokenDetails?.symbol} - ${strategy.baseTokenDetails?.symbol}`
                    : "Unknown"}
                </TableCell>
                <TableCell>{strategy.brackets.length}</TableCell>
                <TableCell>
                  {formatSmart(
                    strategy.totalBalance("base"),
                    strategy.baseTokenDetails?.decimals
                  ) || "-"}{" "}
                  {strategy.baseTokenDetails?.symbol}
                </TableCell>
                <TableCell>
                  {formatSmart(
                    strategy.totalBalance("quote"),
                    strategy.baseTokenDetails?.decimals
                  ) || "-"}{" "}
                  {strategy.quoteTokenDetails?.symbol}
                </TableCell>
                <TableCell>TODO</TableCell>
                <TableCell>TODO</TableCell>
                <TableCell>{/* status message */}</TableCell>
                <TableCell>
                  <IconButton onClick={makeStrategyFoldoutHandler(strategy)}>
                    {strategy.transactionHash === foldOutStrategy ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
              <HideableTableRow
                key={`${strategy.transactionHash}-foldout`}
                className={
                  foldOutStrategy !== strategy.transactionHash ? "hide" : ""
                }
              >
                <TableCell colSpan={9} key={strategy.transactionHash}>
                  <Details strategy={strategy} />
                </TableCell>
              </HideableTableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
});
