import Decimal from "decimal.js";
import { useGetPrice } from "./useGetPrice";
import { useTokenDetails } from "./useTokenDetails";

// Quote price in USDC
const USDC = {
  address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  decimals: 6,
  symbol: "USDC",
  name: "USDC",
};

type Params = {
  tokenAddress?: string;
  amount?: string;
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
  const { tokenAddress, amount } = params;

  // Setting address to be queried `undefined` when no amount is provided
  // to avoid fetching price when there's no amount
  const address = Number(amount) > 0 ? tokenAddress : undefined;

  const {
    tokenDetails: baseToken,
    isLoading: isLoadingTokenDetails,
    error: tokenDetailsError,
  } = useTokenDetails(address);

  const { price, isLoading: isLoadingPrice, error: priceError } = useGetPrice({
    baseToken,
    quoteToken: USDC,
  });

  return {
    isLoading: isLoadingTokenDetails || isLoadingPrice,
    amountInUsd: address && price ? price.mul(amount) : null,
    error: tokenDetailsError || priceError || "",
  };
}
