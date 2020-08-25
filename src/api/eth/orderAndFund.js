import tradingHelperInit from "@gnosis.pm/dex-liquidity-provision/scripts/utils/trading_strategy_helpers";
import makeFakeArtifacts from "utils/makeFakeArtifacts";
import TruffleContract from "@truffle/contract";

//const { buildTransferApproveDepositFromOrders } = initializerFunc()

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
    masterSafeAddress,
    tokenBaseContract,
    tokenQuoteContract,
    boundsLowerWei,
    boundsUpperWei,
    investmentBaseWei,
    investmentQuoteWei,
  }
) => {
  const contracts = await Promise.all([
    context.getArtifact("IProxy"),
    context.getArtifact("GnosisSafe"),
    context.getArtifact("IProxy"),
    context.getArtifact("MultiSend"),
    context.getArtifact("BatchExchange"),
    //context.getArtifact("FleetFactoryDeterministic"),
  ]);
  console.log(contracts)

  const { buildTransferApproveDepositFromOrders } = runInitializerIfNotRan(
    context
  );

  // We need to load these contracts before entering buildTransferApproveDepositFromOrders
  // because it uses artifacts.require - even though it's a shim, it still expects to receive
  // contract artifacts without delay (no promises), so we need to preload them here.

  const transactions = await buildTransferApproveDepositFromOrders(
    masterSafeAddress,
    safeAddresses,
    tokenBaseContract.options.address,
    tokenQuoteContract.options.address,
    boundsLowerWei,
    boundsUpperWei,
    100,
    investmentQuoteWei,
    investmentBaseWei,
    false
  );
  console.log(transactions);

  return {
    tx: transactions,
  };
};

export default orderAndFund;
