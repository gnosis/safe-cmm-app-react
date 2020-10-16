import { useCallback, useState, useEffect, useContext } from "react";
import useInterval from "@use-it/interval";

import getLogger from "utils/logger";

import findStrategiesForOwner from "api/web3/findStrategiesForOwner";

import Strategy from "logic/strategy";
import { ContractInteractionContext } from "components/context/ContractInteractionProvider";

const logger = getLogger("web3-strategy-hook");

interface Web3StrategyHook {
  status: string;
  strategies: Strategy[];
}

const useWeb3Strategies = (): Web3StrategyHook => {
  const [status, setStatus] = useState("LOADING");
  const [isFetching, setIsFetching] = useState(false);
  const [strategies, setStrategies] = useState([]);

  const context = useContext(ContractInteractionContext);

  const handleFindStrategies = useCallback(async () => {
    setIsFetching(true);
    try {
      const strategies = await findStrategiesForOwner(context);
      logger.log("Active strategies loaded via web3:", strategies);
      setStatus("SUCCESS");
      setStrategies(strategies);
    } catch (err) {
      setStatus("ERROR");
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  }, [context]);

  useEffect(() => {
    //console.log("start fetching")
    //setStatus("LOADING");
    if (strategies.length === 0) {
      console.log("fetchin");
      handleFindStrategies();
    }
    //handleFindStrategies();
  }, [strategies, handleFindStrategies]);

  /*useInterval(() => {
    if (!isFetching) {
      handleFindStrategies();
    }
  }, 10000);*/

  return {
    status,
    strategies,
  };
};

export default useWeb3Strategies;
