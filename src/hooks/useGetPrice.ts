import { useState, useCallback, useEffect } from "react";
import Decimal from "decimal.js";

import { getOneinchPrice } from "@gnosis.pm/dex-liquidity-provision/scripts/utils/price_utils";

import { TokenDetails } from "types";

export type PriceSources = "1inch";

export interface Params {
  source?: PriceSources;
  baseToken?: TokenDetails;
  quoteToken?: TokenDetails;
}

interface Result {
  price: Decimal | null;
  isLoading: boolean;
  error: string;
}

/**
 * Wrapper around original `getOneinchPrice` function to convert output to Decimal|null
 * and encapsulate whatever source specific logic there might be
 */
async function get1InchPrice(
  baseToken: TokenDetails,
  quoteToken: TokenDetails
): Promise<Decimal | null> {
  const { price } = await getOneinchPrice(baseToken, quoteToken);
  return price ? new Decimal(String(price)) : null;
}

/**
 * Fetches price from given `source`, `baseToken` and `quoteToken`.
 * `price` is `null` when no price is found.
 * `error` is set when an error occurred.
 * `source` defaults to `1inch`.
 */
export function useGetPrice(params: Params): Result {
  const { source = "1inch", baseToken, quoteToken } = params;

  const [price, setPrice] = useState<Decimal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getPrice = useCallback(async (params: Required<Params>): Promise<
    void
  > => {
    const { source, baseToken, quoteToken } = params;

    setIsLoading(true);
    setError("");

    let price: Decimal | null = null;
    try {
      // Switch might seen overkill since there's only 1 type ATM, but there might be more.
      // Paving the way for new sources
      switch (source) {
        case "1inch": {
          price = await get1InchPrice(baseToken, quoteToken);

          break;
        }
      }
    } catch (e) {
      const msg = `Failed to fetch price from '${source}' for '${baseToken.symbol}'/'${quoteToken.symbol}' pair`;
      console.error(msg, e);

      setError(msg);
    }

    setIsLoading(false);
    setPrice(price);
  }, []);

  useEffect((): void => {
    baseToken && quoteToken && getPrice({ source, baseToken, quoteToken });
  }, [source, baseToken, quoteToken]);

  return { price, isLoading, error };
}
