import tradingHelperInit from "@gnosis.pm/dex-liquidity-provision/scripts/utils/trading_strategy_helpers";
import makeFakeArtifacts from "utils/makeFakeArtifacts";

let initializedTradingStrategyHelpers;
/**
 * Runs the initializer for trading helpers once and returns the cached return after that.
 *
 * @param {Object} context
 */
const runInitializerIfNotRan = (context) => {
  if (!initializedTradingStrategyHelpers) {
    initializedTradingStrategyHelpers = tradingHelperInit(
      context.web3Instance,
      makeFakeArtifacts(context)
    );
  }
  return initializedTradingStrategyHelpers;
};

export default runInitializerIfNotRan;
