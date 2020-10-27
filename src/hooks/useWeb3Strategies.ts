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

// sorry about this - workaround to make sure we dont refresh when we're already fetching
let isFetching = false;
export const useWeb3Strategies = (): Web3StrategyHook => {
  const [status, setStatus] = useState("LOADING");
  const [strategies, setStrategies] = useState([]);

  const context = useContext(ContractInteractionContext);

  const handleFindStrategies = useCallback(async () => {
    if (isFetching) {
      logger.log("already fetching, ignoring interval/refresh");
      return;
    }

    isFetching = true;
    try {
      const strategies = await findStrategiesForOwner(context);
      logger.log("Active strategies loaded via web3:", strategies);
      setStatus("SUCCESS");
      setStrategies(strategies);
    } catch (err) {
      setStatus("ERROR");
      console.error(err);
    } finally {
      isFetching = false;
    }
  }, [context]);

  useEffect(() => {
    if (strategies.length === 0) {
      logger.log("fetching strategies");
      handleFindStrategies();
    }
  }, [strategies, handleFindStrategies]);

  return {
    status,
    strategies,
  };
};
