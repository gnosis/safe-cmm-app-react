import { useState, useContext, useEffect } from "react";
import { TokenDetails } from "types";

import { tokenDetailsState } from "state/atoms";
import { useRecoilValue } from "recoil";

interface Return {
  tokenDetails?: TokenDetails;
  isLoading: boolean;
  error: string;
}

/**
 * Syntactic sugar to get token details for given token address
 */
export function useTokenDetails(
  tokenAddress?: string
): TokenDetails | undefined {
  const tokenDetails = useRecoilValue(tokenDetailsState);

  return tokenDetails[tokenAddress];
}
