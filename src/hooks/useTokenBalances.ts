import BN from "bn.js";
import { ContractInteractionContext } from "components/context/ContractInteractionProvider";
import { fromPairs } from "lodash";
import { useCallback, useContext, useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { tokenBalancesState } from "state/atoms";
import { tokenListState } from "state/selectors";

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

  const updateBalances = useCallback(async (): Promise<void> => {
    if (updating) {
      return;
    }
    updating = true;
    setIsLoading(true);
    setError("");

    console.log("----------------- updating balances");

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
        console.error(msg, e);
        setError(msg);
      }
    }
    setIsLoading(false);
    updating = false;
  }, [fetchTokenBalance, setBalances, tokenList]);

  useEffect(() => {
    updateBalances();

    // TODO: update on new block instead of interval
    const interval = setInterval(updateBalances, 10000);

    return () => clearInterval(interval);
  }, [updateBalances]);

  return { balances, isLoading, error };
}
