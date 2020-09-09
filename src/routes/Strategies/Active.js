import React, { useCallback, useContext, useState } from "react";

import styled from "styled-components";

import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@material-ui/core";

import { Button, Loader, Icon, Text } from "@gnosis.pm/safe-react-components";
import useWeb3Strategies from "hooks/useWeb3Strategies";

import { Web3Context } from "components/Web3Provider";

import withdrawFunds from "api/withdrawFunds";

const CenterLoaderBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const Active = () => {
  const context = useContext(Web3Context);
  const { strategies, status } = useWeb3Strategies();

  const [withdrawStatusForRow, setWithdrawStatusForRow] = useState({});

  const handleSetWithdrawStatusForStrategyWithBlockhash = useCallback(
    (transactionHash, statusText, errorMessage = null) => {
      setWithdrawStatusForRow((prev) => ({
        ...prev,
        [transactionHash]: {
          status: statusText,
          errorMessage,
        },
      }));
    },
    []
  );

  const makeHandleWithdraw = useCallback(
    (strategy) => async () => {
      handleSetWithdrawStatusForStrategyWithBlockhash(
        strategy.transactionHash,
        "LOADING"
      );
      try {
        const { txs } = await withdrawFunds(context, strategy);
        if (txs.length === 0) {
          throw new Error(
            "Nothing to redeem.\nNo bracket contains more than >1 USD in value excluding it's funding."
          );
        }
        await context.sdk.sendTransactions(txs);
        handleSetWithdrawStatusForStrategyWithBlockhash(
          strategy.transactionHash,
          "SUCCESS"
        );
      } catch (err) {
        handleSetWithdrawStatusForStrategyWithBlockhash(
          strategy.transactionHash,
          "ERROR",
          err.message
        );
      }
    },
    [context, handleSetWithdrawStatusForStrategyWithBlockhash]
  );

  return (
    <Box>
      {status === "LOADING" && (
        <CenterLoaderBox>
          <Loader size="lg" />
        </CenterLoaderBox>
      )}
      {status === "SUCCESS" && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Created</TableCell>
                <TableCell>Token Pair</TableCell>
                <TableCell>Start Price</TableCell>
                <TableCell>Brackets</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {strategies.map((strategy) => (
                <TableRow key={strategy.transactionHash}>
                  <TableCell>{strategy.created.toLocaleString()}</TableCell>
                  <TableCell>
                    {strategy.quoteTokenDetails?.symbol} -{" "}
                    {strategy.baseTokenDetails?.symbol}
                  </TableCell>
                  <TableCell>TODO</TableCell>
                  <TableCell>{strategy.brackets.length}</TableCell>
                  <TableCell>
                    {withdrawStatusForRow[strategy.transactionHash]?.status ===
                      "LOADING" && <Loader size="sm" />}
                    {withdrawStatusForRow[strategy.transactionHash]?.status ===
                      "SUCCESS" && (
                      <Icon type="check" size="md" color="primary" />
                    )}
                    {withdrawStatusForRow[strategy.transactionHash]?.status ===
                      "ERROR" && (
                      <p style={{ whiteSpace: "pre" }}>
                        <Text color="error" size="md">
                          {
                            withdrawStatusForRow[strategy.transactionHash]
                              ?.errorMessage
                          }
                        </Text>
                      </p>
                    )}
                    {(!withdrawStatusForRow[strategy.transactionHash] ||
                      withdrawStatusForRow[strategy.transactionHash]?.status !==
                        "LOADING") && (
                      <Button
                        size="lg"
                        color="primary"
                        variant="contained"
                        onClick={makeHandleWithdraw(strategy)}
                      >
                        Withdraw
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Active;
