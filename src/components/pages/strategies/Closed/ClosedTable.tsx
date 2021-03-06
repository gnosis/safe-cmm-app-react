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
  Box,
} from "@material-ui/core";
import ChevronDown from "@material-ui/icons/KeyboardArrowDown";
import ChevronUp from "@material-ui/icons/KeyboardArrowUp";

import { Loader } from "@gnosis.pm/safe-react-components";

import { StrategyState } from "types";

import { formatSmart } from "utils/format";

import { Text } from "components/basic/display/Text";

import { FoldOut } from "../FoldOut";

import { StrategyTab } from "./StrategyTab";

const CenteredBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
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

function totalClaimable(strategy: StrategyState): string {
  const { baseToken, baseBalance, quoteToken, quoteBalance } = strategy;

  return `${formatSmart(baseBalance)} ${baseToken?.symbol} | ${formatSmart(
    quoteBalance
  )} ${quoteToken?.symbol}`;
}

export interface Props {
  strategies: StrategyState[];
  loading: boolean;
}

export const ClosedTable = memo(function ClosedTable({
  strategies,
  loading,
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
            <TableCell>Brackets</TableCell>
            <TableCell>Total Value Claimable</TableCell>
            <TableCell />
            {/* status */}
            <TableCell />
            {/* expand */}
          </TableRow>
        </StyledTableHeader>
        <TableBody>
          {strategies.map((strategy) => (
            <React.Fragment key={strategy.transactionHash}>
              <TableRow hover onClick={makeStrategyFoldoutHandler(strategy)}>
                <TableCell>{strategy.created.toLocaleString()}</TableCell>
                <TableCell>
                  {strategy.quoteToken && strategy.baseToken
                    ? `${strategy.baseToken?.symbol} - ${strategy.quoteToken?.symbol}`
                    : "Unknown"}
                </TableCell>
                <TableCell>
                  {strategy.brackets ? (
                    strategy.brackets.length
                  ) : (
                    <Loader size="sm" />
                  )}
                </TableCell>
                <TableCell>
                  {strategy.status === "CLOSED" ? (
                    <Text>Already claimed</Text>
                  ) : strategy.hasFetchedBalance ? (
                    <Text>{totalClaimable(strategy)}</Text>
                  ) : (
                    <Loader size="xs" />
                  )}
                </TableCell>
                <TableCell>{/* status message */}</TableCell>
                <TableCell>
                  <IconButton>
                    {strategy.transactionHash === foldOutStrategy ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
              {foldOutStrategy === strategy.transactionHash && (
                <TableRow>
                  <TableCell colSpan={6} key={strategy.transactionHash}>
                    <FoldOut
                      strategy={strategy}
                      StrategyComponent={StrategyTab}
                    />
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
          {loading && (
            <TableRow key="loading">
              <TableCell colSpan={6}>
                <CenteredBox>
                  <Loader size="sm" />
                </CenteredBox>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
});
