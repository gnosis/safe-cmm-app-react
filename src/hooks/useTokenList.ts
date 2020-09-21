import { useContext } from "react";
import { TokenDetails } from "types";

import { Web3Context } from "components/Web3Provider";

/**
 * useTokenList hook
 *
 * Syntactic sugar to get only the token list from context
 * Maybe unnecessary?
 */
export function useTokenList(): TokenDetails[] {
  const { tokenList } = useContext(Web3Context);

  return tokenList;
}
