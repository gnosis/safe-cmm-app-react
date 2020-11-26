import BN from "bn.js";
import { useEffect, useState } from "react";
import { useTokenBalances } from "./useTokenBalances";

/**
 * Fetches balance of current Safe for given token address.
 * Returns the balance as BN, if any
 *
 * Does not update local state if object contents is the same (to avoid unnecessary re-renders )
 *
 * @param tokenAddress Address of token to query the balance for current Safe
 */
export function useTokenBalance(tokenAddress?: string): BN | null {
  const { balances } = useTokenBalances();
  const [balance, setBalance] = useState<null | BN>(null);

  useEffect(() => {
    const newBalance = balances[tokenAddress];

    // Skip when balances are equal
    if (balance && newBalance && balance.eq(newBalance)) {
      return;
    }
    setBalance(newBalance);
  }, [balances, balance, tokenAddress]);

  return balance;
}
