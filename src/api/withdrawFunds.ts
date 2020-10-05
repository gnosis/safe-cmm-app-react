import { amountUSDValue } from "@gnosis.pm/dex-liquidity-provision/scripts/utils/price_utils";
import {
  MAXUINT256,
  ONE,
} from "@gnosis.pm/dex-liquidity-provision/scripts/utils/constants";
import {
  importTradingStrategyHelpers,
  importWithdrawWrapper,
} from "api/utils/dexImports";
import { getWithdrawableAmount } from "@gnosis.pm/dex-contracts";

import getLogger from "utils/logger";

import { Web3Context } from "types";
import Strategy from "logic/strategy";

import BN from "bn.js";

const logger = getLogger("withdraw");

export const withdrawRequest = async (
  context: Web3Context,
  strategy: Strategy
): Promise<void> => {
  await Promise.all([
    context.getArtifact("IProxy"),
    context.getArtifact("GnosisSafe"),
    context.getArtifact("MultiSend"),
    context.getArtifact("BatchExchange"),
    context.getArtifact("FleetFactory"),
    context.getArtifact("GnosisSafeProxyFactory"),
  ]);

  const amountFunction = async function (
    bracketAddress,
    tokenData,
    exchange
  ): Promise<string> {
    const amount = (
      await exchange.getBalance(bracketAddress, tokenData.address)
    ).toString();
    const usdValue = await amountUSDValue(amount, tokenData, {});
    logger.log(
      `(request) ${bracketAddress} holds ${amount} (${usdValue}$) in ${tokenData.symbol}`
    );
    if (usdValue.gte(ONE)) {
      return MAXUINT256.toString();
    } else {
      return "0";
    }
  };

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
    `(request) started building withdraw transaction for ${withdrawals.length} withdraws`
  );

  const { transactionGenericFundMovement } = importTradingStrategyHelpers(
    context
  );

  return transactionGenericFundMovement(
    context.safeInfo.safeAddress,
    withdrawals,
    "requestWithdraw"
  );
};

export const withdrawClaim = async (
  context: Web3Context,
  strategy: Strategy
): Promise<void> => {
  await Promise.all([
    context.getArtifact("IProxy"),
    context.getArtifact("GnosisSafe"),
    context.getArtifact("MultiSend"),
    context.getArtifact("BatchExchange"),
    context.getArtifact("FleetFactory"),
    context.getArtifact("GnosisSafeProxyFactory"),
  ]);

  const amountFunction = async function (
    bracketAddress,
    tokenData,
    exchange
  ): Promise<string | BN> {
    const amount = await getWithdrawableAmount(
      bracketAddress,
      tokenData.address,
      exchange,
      context.instance
    );
    logger.log(
      `(claim) requesting to claim ${amount.toString()} of ${
        tokenData.symbol
      } from ${bracketAddress}`
    );
    return amount;
  };

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
    `(claim) started building withdraw claim transaction for ${withdrawals.length} withdraws`
  );

  const {
    transactionsWithdrawAndTransferFundsToMaster,
  } = importTradingStrategyHelpers(context);

  return transactionsWithdrawAndTransferFundsToMaster(
    context.safeInfo.safeAddress,
    withdrawals
  );
};
