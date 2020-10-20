import { parseAmount } from "@gnosis.pm/dex-js";
import { Validator } from "./types";

import BN from "bn.js";
import { TokenDetails } from "types";

/**
 * Validator factory that takes in `getErc20Details` function from Web3Context
 * to check whether given value is greater than balance for given token address
 *
 * @param getErc20Details Async function that takes in a tokenAddress and returns TokenBalance
 */
export const hasBalanceFactory = (
  getErc20Details: (address: string) => Promise<TokenDetails>
) => (
  tokenAddress: string,
  tokenBalance: BN | undefined
): Validator => (/* fieldName */) => async (value) => {
  // Don't validate unless we have all the required input
  if (!tokenAddress || !value || !tokenBalance) {
    return undefined;
  }
  const details = await getErc20Details(tokenAddress);
  const bnAmount = parseAmount(value, details.decimals);

  if (bnAmount.gt(tokenBalance)) {
    return { label: `Insufficient balance for ${details.symbol} token` };
  }
  return undefined;
};
