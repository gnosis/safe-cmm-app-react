import React, { memo, useState, useCallback } from "react";
import styled from "styled-components";

import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@material-ui/core";

import ChevronDown from "@material-ui/icons/KeyboardArrowDown";
import ChevronUp from "@material-ui/icons/KeyboardArrowUp";
//import { Details } from "./Details";
import { StrategyState } from "types";
import { SafeStrategy } from "logic/SafeStrategy";
import { Loader } from "@gnosis.pm/safe-react-components";
import { decimalFormat } from "utils/decimalFormat";

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
  strategies: StrategyState[];
}

export const PendingTable = memo(function PendingTable({
  strategies,
}: Props): JSX.Element {
  const [foldOutStrategy, setFoldOutStrategy] = useState(null);

  const makeStrategyFoldoutHandler = useCallback((strategy: StrategyState) => {
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
            <TableCell>Created</TableCell>
            <TableCell>Token Pair</TableCell>
            <TableCell>Nonce</TableCell>
            <TableCell>Price Range</TableCell>
            <TableCell>Brackets</TableCell>
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
                  {strategy.quoteToken && strategy.baseToken
                    ? `${strategy.quoteToken?.symbol} - ${strategy.baseToken?.symbol}`
                    : "Unknown"}
                </TableCell>
                <TableCell>{strategy.nonce}</TableCell>
                <TableCell>
                  {decimalFormat(
                    strategy.priceRange.lower,
                    strategy.priceRange.token
                  )}
                  {" - "}
                  {decimalFormat(
                    strategy.priceRange.upper,
                    strategy.priceRange.token
                  )}
                </TableCell>
                <TableCell>
                  {strategy.brackets ? (
                    strategy.brackets.length
                  ) : (
                    <Loader size="sm" />
                  )}
                </TableCell>
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
                <TableCell colSpan={7} key={strategy.transactionHash}>
                  {/*foldOutStrategy === strategy.transactionHash && (
                    <Details strategy={strategy} />
                  )*/}
                </TableCell>
              </HideableTableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
});
