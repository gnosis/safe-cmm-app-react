import Decimal from "decimal.js";
import { useRecoilValue } from "recoil";

import { PriceSources } from "api/prices";

import { usdReferenceTokenState } from "state/selectors";

import { useGetPrice } from "./useGetPrice";
import { useTokenDetails } from "./useTokenDetails";

type Params = {
  tokenAddress?: string;
  amount?: string;
  source?: PriceSources;
  sourceOptions?: Record<string, any>;
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
  const { tokenAddress, amount, source, sourceOptions } = params;

  // Setting address to be queried `undefined` when no amount is provided
  // to avoid fetching price when there's no amount
  const address = Number(amount) > 0 ? tokenAddress : undefined;

  const baseToken = useTokenDetails(address);

  const usdReferenceToken = useRecoilValue(usdReferenceTokenState);

  const { price, isLoading: isLoadingPrice, error: priceError } = useGetPrice({
    baseToken,
    quoteToken: usdReferenceToken,
    source,
    sourceOptions,
  });

  return {
    isLoading: isLoadingPrice,
    amountInUsd: address && price ? price.mul(amount) : null,
    error: priceError || "",
  };
}
