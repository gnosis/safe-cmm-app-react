import BN from "bn.js";
import { useRecoilState } from "recoil";
import { tokenBalancesState } from "state/atoms";

/**
 * Fetches balance of current Safe for given token address.
 * Returns the balance as BN, if any
 *
 * Syntactic sugar over `getErc20Details` and getting the returned object's `balance`
 *
 * @param tokenAddress Address of token to query the balance for current Safe
 */
export function useTokenBalance(tokenAddress?: string): BN {
  const [tokenBalances] = useRecoilState(tokenBalancesState);
  const balance = tokenBalances[tokenAddress];
  return balance == null ? null : new BN(balance);
}
