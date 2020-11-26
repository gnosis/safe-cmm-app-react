import React, { useCallback, useContext, useState } from "react";
import { SetterOrUpdater, useRecoilState } from "recoil";
import moment from "moment";
import useInterval from "@use-it/interval";

import { Button, Loader } from "@gnosis.pm/safe-react-components";

import { withdrawStatesState } from "state/atoms";

import { StrategyState, WithdrawState } from "types";
import storage from "api/storage";

import {
  buildWithdrawClaimTxs,
  buildWithdrawRequestTxs,
} from "api/withdrawFunds";

import { Text } from "components/basic/display/Text";

import {
  ContractInteractionContext,
  ContractInteractionContextProps,
} from "components/context/ContractInteractionProvider";
import { ModalContext } from "components/context/ModalProvider";

export type Props = {
  strategy: StrategyState;
};

type ButtonStatus =
  | "unknown"
  | "request_ready"
  | "claim_ready"
  | "wait_claim"
  | "wait_tx_execution";

const withdrawFactory = (
  context: ContractInteractionContextProps,
  setWithdrawStates: SetterOrUpdater<Record<string, WithdrawState>>,
  setButtonState: React.Dispatch<React.SetStateAction<ButtonStatus>>,
  strategy: StrategyState,
  type: "request" | "claim"
) => async (): Promise<void> => {
  setWithdrawStates((states) => ({
    ...states,
    [strategy.transactionHash]: { status: "loading" },
  }));
  const buildTxsFn =
    type === "request" ? buildWithdrawRequestTxs : buildWithdrawClaimTxs;

  try {
    const txs = await buildTxsFn(context, strategy);

    if (!txs) {
      throw new Error(
        "No funds available to withdraw.\nNo bracket contains more than >1 USD in value."
      );
    }

    console.log(`About to send the txs`, txs);

    const message = context.sdkInstance.sendTransactions(txs);
    console.log(message);

    // success, withdraw request complete
    setWithdrawStates((states) => ({
      ...states,
      [strategy.transactionHash]: { status: "success" },
    }));

    setButtonState("wait_tx_execution");
  } catch (e) {
    console.error(e);

    // error, withdraw failed, set error message
    setWithdrawStates((states) => ({
      ...states,
      [strategy.transactionHash]: { status: "error", message: e.message },
    }));
  }
};

// export const WithdrawButton = memo(function WithdrawButton(
export function WithdrawButton(props: Props): React.ReactElement {
  const { strategy } = props;
  // don't think this is being updated. maybe we need to get rid of the memo
  const { status, withdrawRequestDate } = strategy;

  const context = useContext(ContractInteractionContext);

  const [btnStatus, setStatus] = useState<ButtonStatus>("unknown");

  const [withdrawStates, setWithdrawStates] = useRecoilState(
    withdrawStatesState
  );

  const { openModal } = useContext(ModalContext);

  const [countdown, setCountdown] = useState("");

  const updateTimer = useCallback((): void => {
    if (status === "ACTIVE") {
      if (btnStatus !== "wait_tx_execution") {
        // Update state only if not just sent a tx.
        // Otherwise user will be able to send another tx right away.
        setStatus("request_ready");
      }
      return;
    }

    if (status === "TRADING_STOPPED") {
      const timeSinceWithdrawRequestBlock = moment.duration(
        moment(withdrawRequestDate).add(5, "minutes").diff(moment())
      );

      if (timeSinceWithdrawRequestBlock.as("seconds") < 0) {
        if (btnStatus !== "wait_tx_execution") {
          // Update state only if not just sent a tx.
          // Otherwise user will be able to send another tx right away.
          setStatus("claim_ready");
        }
      } else {
        setStatus("wait_claim");
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
    }
  }, [status, btnStatus, withdrawRequestDate]);

  useInterval(updateTimer, 1000);

  const openModalOrWithdrawRequest = useCallback(async () => {
    const shouldSkipModal = !!(await storage.getItem("withdrawFlowSkip"));

    try {
      const withdrawRequestHandler = withdrawFactory(
        context,
        setWithdrawStates,
        setStatus,
        strategy,
        "request"
      );

      if (shouldSkipModal) {
        return withdrawRequestHandler();
      } else {
        openModal("WithdrawLiquidity", {
          strategy,
          title: "Remove All Liquidity",
          onConfirm: withdrawRequestHandler,
        });
      }
    } catch (err) {
      console.error("Withdraw Button failed");
      console.error(err);
    }
  }, [strategy, context, openModal, setWithdrawStates]);

  if (status === "CLOSED") {
    return <Text size="md">Strategy closed</Text>;
  }

  if (status !== "ACTIVE" && status !== "TRADING_STOPPED") {
    // Existing claim event means the market was closed.
    // TODO: Move this to a status variable with more thorough checks for actual "deactivated" markets
    return (
      <Text size="md" color="error">
        Invalid Strategy Status: {status}
      </Text>
    );
  }

  if (withdrawStates[strategy.transactionHash]?.status === "loading") {
    // Transaction is pending
    return <Loader size="sm" color="primary" />;
  }

  if (withdrawStates[strategy.transactionHash]?.status === "error") {
    // Error occurred during withdrawClaim/withdrawRequest
    return (
      <Text size="md" color="error">
        {withdrawStates[strategy.transactionHash]?.message}
      </Text>
    );
  }

  if (btnStatus === "unknown") {
    // Status not yet known, timer didn't run yet, show loader with no action on click
    return (
      <Button size="md" color="primary" variant="contained" disabled>
        <Loader size="sm" color="white" />
      </Button>
    );
  }

  if (btnStatus === "wait_tx_execution") {
    // Request/Claim created, pending safe execution
    return (
      <Button size="md" color="primary" variant="contained" disabled>
        Pending transaction execution
      </Button>
    );
  }

  if (btnStatus === "wait_claim") {
    // Waiting the 5min period to claim the withdraw
    return (
      <Button size="md" color="primary" variant="contained" disabled>
        {countdown} until claim
      </Button>
    );
  }

  if (btnStatus === "claim_ready") {
    // Withdraw can now be claimed
    return (
      <Button
        size="md"
        color="primary"
        variant="contained"
        onClick={withdrawFactory(
          context,
          setWithdrawStates,
          setStatus,
          strategy,
          "claim"
        )}
      >
        Claim all balances
      </Button>
    );
  }

  if (btnStatus === "request_ready") {
    // No withdraw event found, can be requested
    return (
      <Button
        size="md"
        color="primary"
        variant="contained"
        onClick={openModalOrWithdrawRequest}
      >
        Request Withdraw (5min)
      </Button>
    );
  }

  // TODO: default is to return null??? o.O
  return <span>Strategy closed</span>;
  // });
}
