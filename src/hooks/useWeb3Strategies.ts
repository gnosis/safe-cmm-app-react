import { useCallback, useState, useEffect, useContext } from "react";
import useInterval from "@use-it/interval";

import getLogger from "utils/logger";

import findStrategiesForOwner from "api/web3/findStrategiesForOwner";
import { Web3Context } from "components/Web3Provider";

import { Web3Context as Web3ContextType } from "types";

const logger = getLogger("web3-strategy-hook");

const useWeb3Strategies = (): any => {
  const [status, setStatus] = useState("LOADING");
  const [isFetching, setIsFetching] = useState(false);
  const [strategies, setStrategies] = useState([]);

  const context: Web3ContextType = useContext(Web3Context);

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
    setStatus("LOADING");
    handleFindStrategies();
  }, [handleFindStrategies]);

  useInterval(() => {
    if (!isFetching) {
      handleFindStrategies();
    }
  }, 10000);

  return {
    status,
    strategies,
  };
};

export default useWeb3Strategies;
