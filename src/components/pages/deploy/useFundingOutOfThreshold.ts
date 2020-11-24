import { useAmountInUsd } from "hooks/useAmountInUsd";
import { useSafeInfo } from "hooks/useSafeInfo";

import { Network } from "utils/constants";

type UseFundingOutOfThresholdParams = {
  fundingAmount?: string;
  brackets?: number;
  tokenAddress?: string;
  threshold: number;
};

/**
 * Checks whether given `fundingAmount` has at least `threshold` in USD per bracket.
 * Returns true when amount per bracket is bellow the threshold.
 * Skips check on xdai.
 */
export function useFundingOutOfThreshold(
  params: UseFundingOutOfThresholdParams
): boolean {
  const { fundingAmount, brackets, tokenAddress, threshold } = params;

  const { network } = useSafeInfo();
  const isXdai = Network[network] === Network.xdai;

  const { amountInUsd } = useAmountInUsd({
    tokenAddress: isXdai ? undefined : tokenAddress,
    amount: fundingAmount,
  });

  if (!fundingAmount || isNaN(+fundingAmount) || !brackets || !amountInUsd) {
    return false;
  }

  return !amountInUsd.div(brackets).gte(threshold);
}
