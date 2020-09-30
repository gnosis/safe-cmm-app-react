import { useContext, useEffect, useState } from "react";
import BN from "bn.js";

import { Web3Context } from "components/Web3Provider";

export interface UseTokenBalanceResult {
  balance: BN | null;
  isLoading: boolean;
  error: string;
}

/**
 * Fetches balance of current Safe for given token address.
 * Returns the balance as BN, if any
 *
 * Syntactic sugar over `getErc20Details` and getting the returned object's `balance`
 *
 * @param tokenAddress Address of token to query the balance for current Safe
 */
export function useTokenBalance(tokenAddress?: string): UseTokenBalanceResult {
  const [balance, setBalance] = useState<BN | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { getErc20Details } = useContext(Web3Context);

  useEffect(() => {
    if (!tokenAddress) {
      return;
    }

    async function getBalance(): Promise<void> {
      setIsLoading(true);
      setError("");

      try {
        const details = await getErc20Details(tokenAddress);
        setBalance(details.balance);
      } catch (e) {
        console.error(`Failed to fetch balance of token '${tokenAddress}'`, e);
        setError(`Failed to fetch balance of token '${tokenAddress}'`);
      }
      setIsLoading(false);
    }

    getBalance();
  }, [tokenAddress, getErc20Details]);

  return { balance, isLoading, error };
}
