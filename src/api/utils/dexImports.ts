import tradingHelperInit from "@gnosis.pm/dex-liquidity-provision/scripts/utils/trading_strategy_helpers";
import calcFleetAddressInit from "@gnosis.pm/dex-liquidity-provision/scripts/utils/calculate_fleet_addresses";
import withdrawWrapperInit from "@gnosis.pm/dex-liquidity-provision/scripts/wrapper/withdraw";

import makeFakeArtifacts from "utils/makeFakeArtifacts";
import { Web3Context } from "types";

let tradingHelperInstance;
export const importTradingStrategyHelpers = (context: Web3Context): any => {
  if (!tradingHelperInstance) {
    tradingHelperInstance = tradingHelperInit(
      context.instance,
      makeFakeArtifacts(context)
    );
  }

  return tradingHelperInstance;
};

let calcFleetAddrInstance;
export const importCalculateFleetAddresses = (context: Web3Context): any => {
  if (!calcFleetAddrInstance) {
    calcFleetAddrInstance = calcFleetAddressInit(
      context.instance,
      makeFakeArtifacts(context)
    );
  }

  return calcFleetAddrInstance;
};

let withdrawWrapperInstance;
export const importWithdrawWrapper = (context: Web3Context): any => {
  if (!withdrawWrapperInstance) {
    withdrawWrapperInstance = withdrawWrapperInit(
      context.instance,
      makeFakeArtifacts(context)
    );
  }

  return withdrawWrapperInstance;
};
