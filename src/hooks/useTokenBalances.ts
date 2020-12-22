import { useCallback, useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { fromPairs } from "lodash";
import BN from "bn.js";

import { tokenBalancesState } from "state/atoms";
import { tokenListState } from "state/selectors";

import { useNewBlockHeader } from "hooks/useNewBlockHeader";

import getLogger from "utils/logger";

import { ContractInteractionContext } from "components/context/ContractInteractionProvider";

const logger = getLogger("balances-loader");

export type Balances = Record<string, BN>;

export type Return = {
  balances: Balances;
  isLoading: boolean;
  error: string;
};

let updating = false;

export function useTokenBalances(): Return {
  const [balances, setBalances] = useRecoilState(tokenBalancesState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const tokenList = useRecoilValue(tokenListState);

  const { fetchTokenBalance } = useContext(ContractInteractionContext);
  const newBlock = useNewBlockHeader();

  const updateBalances = useCallback(async (): Promise<void> => {
    if (updating) {
      return;
    }
    updating = true;
    setIsLoading(true);
    setError("");

    logger.log("updating balances");

    if (fetchTokenBalance) {
      try {
        const balancesTuples = await Promise.all(
          tokenList.map(async ({ address }) => {
            return [address, await fetchTokenBalance(address)];
          })
        );
        const newBalances = fromPairs(balancesTuples);

        setBalances((curr) => ({ ...curr, ...newBalances }));
      } catch (e) {
        const msg = "Failed to update balances";
        logger.error(msg, e);
        setError(msg);
      }
    }

    setIsLoading(false);
    updating = false;
  }, [fetchTokenBalance, setBalances, tokenList]);

  useEffect(() => {
    updateBalances();
  }, [updateBalances, newBlock]);

  return { balances, isLoading, error };
}
