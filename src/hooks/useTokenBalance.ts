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
 * @param tokenAddress Address of token to query the balance for current Safe
 */
export function useTokenBalance(tokenAddress?: string): UseTokenBalanceResult {
  const [balance, setBalance] = useState<BN | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { safeInfo, getContract } = useContext(Web3Context);

  // TODO: cache responses so we don't have to query the network on every single change
  // TODO: also, we should subscribe to new block header if available and query the balance
  // on every change
  useEffect(() => {
    setIsLoading(true);
    setError("");

    async function getBalance(): Promise<void> {
      if (!tokenAddress || !safeInfo.safeAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const contract = await getContract("ERC20Detailed", tokenAddress);
        const balance = await contract.methods
          .balanceOf(safeInfo.safeAddress)
          .call();

        setBalance(new BN(balance));
      } catch (e) {
        console.error(
          `Failed to fetch balance of token '${tokenAddress}' for Safe '${safeInfo.safeAddress}'`,
          e
        );
        setError(`Failed to fetch balance of token '${tokenAddress}'`);
      }
      setIsLoading(false);
    }

    getBalance();
  }, [tokenAddress, safeInfo]);

  return { balance, isLoading, error };
}
