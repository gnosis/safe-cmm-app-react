import { useCallback, useContext, useEffect, useState } from "react";
import { TokenDetails } from "types";

import { useRecoilState } from "recoil";
import { tokenBalancesState } from "state/atoms";
import {
  ContractInteractionContext,
  ContractInteractionContextProps,
} from "components/context/ContractInteractionProvider";

/**
 * useTokenList hook
 *
 * Syntactic sugar to get only the token list from context
 * Maybe unnecessary?
 */
export function useTokenList(): TokenDetails[] {
  const [tokenBalances] = useRecoilState(tokenBalancesState);
  const tokenAddresses = Object.keys(tokenBalances);
  const [tokenList, setTokenList] = useState([]);

  const { getErc20Details } = useContext(
    ContractInteractionContext
  ) as ContractInteractionContextProps;

  const handleUpdateTokenList = useCallback(async (): Promise<void> => {
    const tokenDetailList = await Promise.all(
      tokenAddresses.map(
        async (tokenAddress): Promise<TokenDetails> => {
          return getErc20Details(tokenAddress);
        }
      )
    );
    setTokenList(tokenDetailList);
  }, [getErc20Details, tokenAddresses]);

  useEffect(() => {
    // this will re-run whenever a new token was added to the balances
    handleUpdateTokenList();
  }, [tokenBalances]); // FIXME: with the correct dependencies, this will re-render indefinitely

  return tokenList;
}
