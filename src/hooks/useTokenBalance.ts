import { useContext, useEffect, useState } from "react";
import BN from "bn.js";

import { Web3Context } from "components/Web3Provider";

/**
 * Fetches balance of current Safe for given token address.
 * Returns the balance as BN, if any
 *
 * @param tokenAddress Address of token to query the balance for current Safe
 */
export function useTokenBalance(tokenAddress?: string): BN | null {
  const [balance, setBalance] = useState<BN | null>(null);

  const { safeInfo, getContract } = useContext(Web3Context);

  useEffect(() => {
    async function getBalance(): Promise<void> {
      if (!tokenAddress || !safeInfo.safeAddress) {
        return;
      }
      const contract = await getContract("ERC20Detailed", tokenAddress);
      const balance = await contract.methods
        .balanceOf(safeInfo.safeAddress)
        .call();

      setBalance(new BN(balance));
    }

    getBalance();
  }, [tokenAddress, safeInfo]);

  return balance;
}
