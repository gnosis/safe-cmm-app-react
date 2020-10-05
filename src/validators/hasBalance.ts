import { parseAmount } from "@gnosis.pm/dex-js";

import { TokenBalance } from "types";

import { Validator } from "./types";

/**
 * Validator factory that takes in `getErc20Details` function from Web3Context
 * to check whether given value is greater than balance for given token address
 *
 * @param getErc20Details Async function that takes in a tokenAddress and returns TokenBalance
 */
export const hasBalanceFactory = (
  getErc20Details: (address: string) => Promise<TokenBalance>
) => (tokenAddress: string): Validator => (/* fieldName */) => async (
  value
) => {
  // Don't validate unless we have all the required input
  if (!tokenAddress || !value) {
    return undefined;
  }
  const details = await getErc20Details(tokenAddress);
  const bnAmount = parseAmount(value, details.decimals);

  if (bnAmount.gt(details.balance)) {
    return { label: `Insufficient balance for ${details.symbol} token` };
  }
  return undefined;
};
