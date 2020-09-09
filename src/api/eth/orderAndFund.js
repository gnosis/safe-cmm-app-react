import tradingHelperInit from "@gnosis.pm/dex-liquidity-provision/scripts/utils/trading_strategy_helpers";
import makeFakeArtifacts from "utils/makeFakeArtifacts";

import Decimal from "decimal.js";

let initializedTradingStrategyHelpers;
/**
 * Runs the initializer for trading helpers once and returns the cached return after that.
 *
 * @param {Object} context
 */
const runInitializerIfNotRan = (context) => {
  if (!initializedTradingStrategyHelpers) {
    initializedTradingStrategyHelpers = tradingHelperInit(
      context.instance,
      makeFakeArtifacts(context)
    );
  }
  return initializedTradingStrategyHelpers;
};

const orderAndFund = async (
  context,
  {
    safeAddresses,
    currentPriceWei,
    tokenBaseContract,
    tokenQuoteContract,
    boundsLowerWei,
    boundsUpperWei,
    investmentBaseWei,
    investmentQuoteWei,
  }
) => {
  // We need to load these contracts before entering buildTransferApproveDepositFromOrders
  // because it uses artifacts.require - even though it's a shim, it still expects to receive
  // contract artifacts without delay (no promises), so we need to preload them here.
  await Promise.all([
    context.getArtifact("IProxy.sol"),
    context.getArtifact("IProxy"),
    context.getArtifact("GnosisSafe"),
    context.getArtifact("MultiSend"),
    context.getArtifact("BatchExchange"),
    context.getArtifact("FleetFactory"),
    context.getArtifact("FleetFactoryDeterministic"),
  ]);

  const {
    buildTransferApproveDepositFromOrders,
    buildOrders,
  } = runInitializerIfNotRan(context);

  const batchExchangeContract = await context.getDeployed("BatchExchange");
  const [tokenBaseId, tokenQuoteId] = await Promise.all([
    batchExchangeContract.methods
      .tokenAddressToIdMap(tokenBaseContract.options.address)
      .call(),
    batchExchangeContract.methods
      .tokenAddressToIdMap(tokenQuoteContract.options.address)
      .call(),
  ]);

  const orderTransactions = await buildOrders(
    context.safeInfo.safeAddress,
    safeAddresses,
    tokenBaseId,
    tokenQuoteId,
    new Decimal(boundsLowerWei.toString()).div(1e18).toString(),
    new Decimal(boundsUpperWei.toString()).div(1e18).toString(),
    true
  );

  const fundTransactions = await buildTransferApproveDepositFromOrders(
    context.safeInfo.safeAddress,
    safeAddresses,
    tokenBaseContract.options.address,
    tokenQuoteContract.options.address,
    boundsLowerWei,
    boundsUpperWei,
    currentPriceWei,
    investmentQuoteWei,
    investmentBaseWei,
    false
  );

  return {
    txs: [...orderTransactions, ...fundTransactions],
  };
};

export default orderAndFund;
