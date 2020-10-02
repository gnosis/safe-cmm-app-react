import { useState, useCallback, useEffect } from "react";
import Decimal from "decimal.js";
import NodeCache from "node-cache";

import { getOneinchPrice } from "@gnosis.pm/dex-liquidity-provision/scripts/utils/price_utils";

import { TokenDetails } from "types";
import { ONE_DECIMAL, PRICE_CACHE_TIME } from "utils/constants";

export type PriceSources = "1inch";

const cache = new NodeCache({ stdTTL: PRICE_CACHE_TIME });

/**
 * Builds 2 cache keys:
 * 1. Regular for the current token pair
 * 2. Inverted in case regular is not found.
 *  We can then invert the price without another query
 *
 * @param baseToken
 * @param quoteToken
 */
function buildCacheKeys(
  baseToken: TokenDetails,
  quoteToken: TokenDetails
): [string, string] {
  return [
    baseToken.address + quoteToken.address,
    quoteToken.address + baseToken.address,
  ];
}

function fetchPriceFromCache(key: string, invertedKey: string): Decimal | null {
  const price = cache.get<Decimal>(key);
  if (price) {
    return price;
  }

  const invertedPrice = cache.get<Decimal>(invertedKey);
  if (invertedPrice) {
    return ONE_DECIMAL.div(invertedPrice);
  }

  return null;
}

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

    // Race condition.
    // Might be that one token is updated before the other, resulting on both
    // base and quote being the same.
    // We don't want to query the price of a token against itself.
    if (baseToken.address === quoteToken.address) {
      return;
    }

    setIsLoading(true);
    setError("");

    const [cacheKey, invertedCacheKey] = buildCacheKeys(baseToken, quoteToken);

    let price: Decimal | null = fetchPriceFromCache(cacheKey, invertedCacheKey);

    if (!price) {
      try {
        // Switch might seen overkill since there's only 1 type ATM, but there might be more.
        // Paving the way for new sources
        switch (source) {
          case "1inch": {
            price = await get1InchPrice(baseToken, quoteToken);
            break;
          }
        }

        cache.set(cacheKey, price);
      } catch (e) {
        const msg = `Failed to fetch price from '${source}' for '${baseToken.symbol}'/'${quoteToken.symbol}' pair`;
        console.error(msg, e);

        setError(msg);
      }
    }

    setIsLoading(false);
    setPrice(price);
  }, []);

  useEffect((): void => {
    baseToken && quoteToken && getPrice({ source, baseToken, quoteToken });
  }, [source, baseToken, quoteToken, getPrice]);

  return { price, isLoading, error };
}
