import BN from "bn.js";
import { useRecoilValue } from "recoil";
import { tokenBalancesState } from "state/atoms";

/**
 * Fetches balance of current Safe for given token address.
 * Returns the balance as BN, if any
 *
 * Syntactic sugar over `getErc20Details` and getting the returned object's `balance`
 *
 * @param tokenAddress Address of token to query the balance for current Safe
 */
export function useTokenBalance(tokenAddress?: string): BN | null {
  const tokenBalances = useRecoilValue(tokenBalancesState);
  const balance = tokenBalances[tokenAddress];
  return !balance ? null : new BN(balance);
}
