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

  // Maybe token details was not properly fetched?
  if (!details.symbol || !details.decimals) {
    console.error(
      `Not able to load token details for address ${tokenAddress}. Got this:`,
      details
    );
    return {
      label: `Critical data missing`,
      children: `Please reload the app. If the issue persists, reach out for support.`,
    };
  }

  // Maybe the value provided is not a number?
  if (isNaN(+value)) {
    return {
      label: `Invalid funding for ${details.symbol}`,
      children: `"${value}" is not a valid number`,
    };
  }

  const bnAmount = parseAmount(value.trim(), details.decimals);

  // Edge case, `parseAmount` does not return a valid BN
  // This could happen when an invalid value is provided,
  // or when decimals is undefined.
  // Both should be treated above, but in any case, let's
  // check it here as well to be safe
  if (!bnAmount) {
    console.error(
      `Got a falsy "bnAmount" for value "${value}" and decimals "${details.decimals}":`,
      bnAmount
    );
    return {
      label: `Invalid funding for ${details.symbol}`,
      children: `"${value}" is not a valid number`,
    };
  }

  if (bnAmount.gt(tokenBalance)) {
    return { label: `Insufficient balance for ${details.symbol} token` };
  }
  return undefined;
};
