import Decimal from "decimal.js";
import { useMemo, useState } from "react";

import { TokenDetails } from "types";

import { PriceSources, useGetPrice } from "./useGetPrice";
import { useTokenDetails } from "./useTokenDetails";
import { useTokenList } from "./useTokenList";

type Params = {
  tokenAddress?: string;
  amount?: string;
  source?: PriceSources;
};

type Result = {
  isLoading: boolean;
  amountInUsd: Decimal | null;
  error: string;
};

/**
 * Quotes given amount of token in USDC
 */
export function useAmountInUsd(params: Params): Result {
  const { tokenAddress, amount, source } = params;

  // TODO: what about storing this on recoil to avoid extra work?
  const [usdc, setUsdc] = useState<undefined | TokenDetails>(undefined);

  // Setting address to be queried `undefined` when no amount is provided
  // to avoid fetching price when there's no amount
  const address = Number(amount) > 0 ? tokenAddress : undefined;

  const {
    tokenDetails: baseToken,
    isLoading: isLoadingTokenDetails,
    error: tokenDetailsError,
  } = useTokenDetails(address);

  const tokenList = useTokenList();

  // Loading USDC TokenDetails object because depending on the price source,
  // we'll need the token id on the exchange to query it
  useMemo(() => {
    // Only need to find USDC once
    if (!usdc) {
      setUsdc(tokenList.find((token) => token.symbol === "USDC"));
    }
  }, [setUsdc, tokenList, usdc]);

  const { price, isLoading: isLoadingPrice, error: priceError } = useGetPrice({
    baseToken,
    quoteToken: usdc,
    source,
  });

  return {
    isLoading: isLoadingTokenDetails || isLoadingPrice,
    amountInUsd: address && price ? price.mul(amount) : null,
    error: tokenDetailsError || priceError || "",
  };
}
