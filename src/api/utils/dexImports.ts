import tradingHelperInit from "@gnosis.pm/dex-liquidity-provision/scripts/utils/trading_strategy_helpers";
import calcFleetAddressInit from "@gnosis.pm/dex-liquidity-provision/scripts/utils/calculate_fleet_addresses";
import withdrawWrapperInit from "@gnosis.pm/dex-liquidity-provision/scripts/wrapper/withdraw";

import makeFakeArtifacts from "utils/makeFakeArtifacts";
import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";

let tradingHelperInstance;
export const importTradingStrategyHelpers = (
  context: ContractInteractionContextProps
): any => {
  if (!tradingHelperInstance) {
    tradingHelperInstance = tradingHelperInit(
      context.web3Instance,
      makeFakeArtifacts(context)
    );
  }

  return tradingHelperInstance;
};

let calcFleetAddrInstance;
export const importCalculateFleetAddresses = (
  context: ContractInteractionContextProps
): any => {
  if (!calcFleetAddrInstance) {
    calcFleetAddrInstance = calcFleetAddressInit(
      context.web3Instance,
      makeFakeArtifacts(context)
    );
  }

  return calcFleetAddrInstance;
};

let withdrawWrapperInstance;
export const importWithdrawWrapper = (
  context: ContractInteractionContextProps
): any => {
  if (!withdrawWrapperInstance) {
    withdrawWrapperInstance = withdrawWrapperInit(
      context.web3Instance,
      makeFakeArtifacts(context)
    );
  }

  return withdrawWrapperInstance;
};
