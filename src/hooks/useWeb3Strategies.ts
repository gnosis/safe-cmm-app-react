import { useCallback, useState, useEffect, useContext } from "react";

import getLogger from "utils/logger";

import findStrategiesForOwner from "api/web3/findStrategiesForOwner";

import Strategy from "logic/strategy";
import { ContractInteractionContext } from "components/context/ContractInteractionProvider";

const logger = getLogger("web3-strategy-hook");

interface Web3StrategyHook {
  status: string;
  strategies: Strategy[];
}

export const useWeb3Strategies = (): Web3StrategyHook => {
  const [status, setStatus] = useState("LOADING");
  const [strategies, setStrategies] = useState([]);

  const context = useContext(ContractInteractionContext);

  const handleFindStrategies = useCallback(async () => {
    try {
      const strategies = await findStrategiesForOwner(context);
      logger.log("Active strategies loaded via web3:", strategies);
      setStatus("SUCCESS");
      setStrategies(strategies);
    } catch (err) {
      setStatus("ERROR");
      console.error(err);
    }
  }, [context]);

  useEffect(() => {
    if (strategies.length === 0) {
      console.log("fetching strategies");
      handleFindStrategies();
    }
  }, [strategies, handleFindStrategies]);

  return {
    status,
    strategies,
  };
};
