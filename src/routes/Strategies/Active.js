import React, { useCallback, useContext, useState } from "react";
import useInterval from "@use-it/interval";

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

import { Button, Loader, Text } from "@gnosis.pm/safe-react-components";
import useWeb3Strategies from "hooks/useWeb3Strategies";

import { TokenInteractionContext } from "components/context/TokenInteractionProvider";

import { withdrawRequest, withdrawClaim } from "api/withdrawFunds";
import moment from "moment";

const CenterLoaderBox = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const WithdrawButton = ({
  withdrawRequestEvent,
  withdrawClaimEvent,
  withdrawStatus,
  handleWithdrawRequest,
  handleWithdrawClaim,
}) => {
  const [status, setStatus] = useState("UNKNOWN");
  const [countdown, setCountdown] = useState(null);
  const updateTimer = useCallback(() => {
    if (!withdrawRequestEvent) {
      setStatus("REQUEST_READY");
      return null;
    }

    const timeSinceWithdrawRequestBlock = moment.duration(
      moment(withdrawRequestEvent.created).add(5, "minutes").diff(moment())
    );

    if (timeSinceWithdrawRequestBlock.as("seconds") < 0) {
      setStatus("CLAIM_READY");
    } else {
      setStatus("WAIT_CLAIM");
      setCountdown(
        `${timeSinceWithdrawRequestBlock
          .get("minutes")
          .toString()
          .padStart(2, "0")}:${timeSinceWithdrawRequestBlock
          .get("seconds")
          .toString()
          .padStart(2, "0")}`
      );
    }
  }, [withdrawRequestEvent]);
  useInterval(updateTimer, 1000);

  if (withdrawRequestEvent && withdrawClaimEvent) {
    // Existing claim event means the market was closed.
    // TODO: Move this to a status variable with more thorough checks for actual "deactivated" markets
    return null;
  }

  if (withdrawStatus?.status === "LOADING") {
    // Transaction is pending
    return <Loader size="md" />;
  }

  if (withdrawStatus?.status === "ERROR") {
    // Error occurred during withdrawClaim/withdrawRequest
    return (
      <Text size="md" color="error">
        {withdrawStatus?.errorMessage}
      </Text>
    );
  }

  if (status === "UNKNOWN") {
    // Status not yet known, timer didn't run yet, show loader with no action on click
    return (
      <Button size="lg" color="primary" variant="contained">
        <Loader size="sm" color="white" />
      </Button>
    );
  }

  if (status === "WAIT_CLAIM") {
    // Waiting the 5min period to claim the withdraw
    return (
      <Button size="lg" color="primary" variant="contained">
        {countdown} until claim
      </Button>
    );
  }

  if (status === "CLAIM_READY") {
    // Withdraw can now be claimed
    return (
      <Button
        size="lg"
        color="primary"
        variant="contained"
        onClick={handleWithdrawClaim}
      >
        Claim Withdraw
      </Button>
    );
  }

  if (status === "REQUEST_READY") {
    // No withdraw event found, can be requested
    return (
      <Button
        size="lg"
        color="primary"
        variant="contained"
        onClick={handleWithdrawRequest}
      >
        Request Withdraw (5min)
      </Button>
    );
  }
};

const Active = () => {
  const context = useContext(TokenInteractionContext);
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

  const makeHandleWithdrawRequest = useCallback(
    (strategy) => async () => {
      handleSetWithdrawStatusForStrategyWithBlockhash(
        strategy.transactionHash,
        "LOADING"
      );
      try {
        const txs = await withdrawRequest(context, strategy);
        if (txs == null || txs.length === 0) {
          throw new Error(
            "No funds available to request withdraw.\nNo bracket contains more than >1 USD in value."
          );
        }
        console.log("send tx", txs);
        console.log(await context.sdk.sendTransactions(txs));
        handleSetWithdrawStatusForStrategyWithBlockhash(
          strategy.transactionHash,
          "SUCCESS"
        );
      } catch (err) {
        console.error(err);
        handleSetWithdrawStatusForStrategyWithBlockhash(
          strategy.transactionHash,
          "ERROR",
          err.message
        );
      }
    },
    [context, handleSetWithdrawStatusForStrategyWithBlockhash]
  );

  const makeHandleWithdrawClaim = useCallback(
    (strategy) => async () => {
      handleSetWithdrawStatusForStrategyWithBlockhash(
        strategy.transactionHash,
        "LOADING"
      );

      try {
        const txs = await withdrawClaim(context, strategy);
        console.log(txs);
        if (txs == null || txs.length === 0) {
          throw new Error(
            "No funds available to claim withdraw.\nNo bracket contains more than >1 USD in value."
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
      {status === "ERROR" && (
        <Text size="md">Error occurred. Please wait or reload the App.</Text>
      )}
      {status === "SUCCESS" && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Created</TableCell>
                <TableCell>Token Pair</TableCell>
                <TableCell>Price Range</TableCell>
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
                  <TableCell>
                    {strategy.priceRange &&
                      `${strategy.priceRange.lower
                        .toSD(4)
                        .toString()} - ${strategy.priceRange.upper
                        .toSD(4)
                        .toString()} ${strategy.quoteTokenDetails.symbol} per ${
                        strategy.baseTokenDetails.symbol
                      }`}
                  </TableCell>
                  <TableCell>{strategy.brackets.length}</TableCell>
                  <TableCell>
                    <WithdrawButton
                      withdrawRequestEvent={strategy.lastWithdrawRequestEvent}
                      withdrawClaimEvent={strategy.lastWithdrawClaimEvent}
                      withdrawStatus={
                        withdrawStatusForRow[strategy.transactionHash]
                      }
                      handleWithdrawRequest={makeHandleWithdrawRequest(
                        strategy
                      )}
                      handleWithdrawClaim={makeHandleWithdrawClaim(strategy)}
                    />
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
