import Decimal from "decimal.js";
import { useRecoilValue } from "recoil";

import { PriceSources } from "api/prices";

import { usdReferenceTokenState } from "state/selectors";

import { ZERO_DECIMAL } from "utils/constants";
import { safeStringToDecimal } from "utils/calculations";

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

  const amountDecimal = safeStringToDecimal(amount);
  // Setting address to be queried `undefined` when no amount is provided
  // to avoid fetching price when there's no amount
  const address =
    amountDecimal &&
    amountDecimal.gt(ZERO_DECIMAL) &&
    amountDecimal.isFinite() &&
    tokenAddress;

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
    amountInUsd: address && price ? price.mul(amountDecimal) : null,
    error: priceError || "",
  };
}
