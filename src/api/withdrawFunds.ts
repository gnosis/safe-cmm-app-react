import BN from "bn.js";

import { Transaction } from "@gnosis.pm/safe-apps-sdk";
import { amountUSDValue } from "@gnosis.pm/dex-liquidity-provision/scripts/utils/price_utils";
import {
  MAXUINT256,
  ONE,
  ZERO,
} from "@gnosis.pm/dex-liquidity-provision/scripts/utils/constants";
import {
  importTradingStrategyHelpers,
  importWithdrawWrapper,
} from "api/utils/dexImports";
import { getWithdrawableAmount } from "@gnosis.pm/dex-contracts";

import getLogger from "utils/logger";

import Strategy from "logic/strategy";

import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";
import { TokenDetails } from "types";

const logger = getLogger("withdraw");

// Local types.
// When I say local I mean from dex-liquidity

type Withdrawal = {
  bracketAddress: string;
  tokenAddress: string;
  amount: BN;
};

type AmountFunction = (
  bracketAddress: string,
  tokenData: TokenDetails,
  exchange: any
) => Promise<BN>;

// Public exports

export async function buildWithdrawRequestTxs(
  context: ContractInteractionContextProps,
  strategy: Strategy
): Promise<Transaction[]> {
  const withdrawals = await buildWithdrawals(
    context,
    strategy,
    requestWithdrawAmountFunction,
    "request"
  );

  const { transactionGenericFundMovement } = importTradingStrategyHelpers(
    context
  );

  return transactionGenericFundMovement(
    context.safeInfo.safeAddress,
    withdrawals,
    "requestWithdraw"
  );
}

export async function buildWithdrawClaimTxs(
  context: ContractInteractionContextProps,
  strategy: Strategy
): Promise<Transaction[]> {
  const withdrawals = await buildWithdrawals(
    context,
    strategy,
    claimAmountFunctionFactory(context),
    "claim"
  );

  const {
    transactionsWithdrawAndTransferFundsToMaster,
  } = importTradingStrategyHelpers(context);

  return transactionsWithdrawAndTransferFundsToMaster(
    context.safeInfo.safeAddress,
    withdrawals
  );
}

// Helper functions

async function buildWithdrawals(
  context: ContractInteractionContextProps,
  strategy: Strategy,
  amountFunction: AmountFunction,
  type: "request" | "claim"
): Promise<Withdrawal[]> {
  await Promise.all([
    context.getArtifact("IProxy"),
    context.getArtifact("GnosisSafe"),
    context.getArtifact("MultiSend"),
    context.getArtifact("BatchExchange"),
    context.getArtifact("FleetFactory"),
    context.getArtifact("GnosisSafeProxyFactory"),
  ]);

  const { getWithdrawalsAndTokenInfo } = importWithdrawWrapper(context);

  const { withdrawals } = await getWithdrawalsAndTokenInfo(
    amountFunction,
    undefined,
    strategy.brackets.map((bracket) => bracket.address),
    [strategy.baseTokenAddress, strategy.quoteTokenAddress],
    [strategy.baseTokenId, strategy.quoteTokenId],
    true
  );

  logger.log(
    `(${type}) started building withdraw transaction for ${withdrawals.length} withdraws`
  );
  return withdrawals;
}

async function requestWithdrawAmountFunction(
  bracketAddress: string,
  tokenData: TokenDetails,
  exchange: any // TODO: exchange contract type?
): Promise<BN> {
  const amount = (
    await exchange.getBalance(bracketAddress, tokenData.address)
  ).toString();

  let usdValue = ONE;
  try {
    // TODO: remove restriction on xDai, don't even bother checking usdValue
    usdValue = await amountUSDValue(amount, tokenData);
  } catch (e) {
    logger.log(
      `Not able to determine USD value for amount ${amount}, requesting claim.`,
      tokenData,
      e.message
    );
  }

  logger.log(
    `(request) ${bracketAddress} holds ${amount} (${usdValue}$) in ${tokenData.symbol}`
  );

  if (usdValue.gte(ONE)) {
    return MAXUINT256;
  } else {
    return ZERO;
  }
}

const claimAmountFunctionFactory = (context: ContractInteractionContextProps) =>
  async function (
    bracketAddress: string,
    tokenData: TokenDetails,
    exchange: any
  ): Promise<BN> {
    const amount = await getWithdrawableAmount(
      bracketAddress,
      tokenData.address,
      exchange,
      context.web3Instance
    );

    logger.log(
      `(claim) requesting to claim ${amount.toString()} of ${
        tokenData.symbol
      } from ${bracketAddress}`
    );

    return amount;
  };
