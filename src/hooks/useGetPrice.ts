import { useState, useCallback, useEffect } from "react";
import Decimal from "decimal.js";
import NodeCache from "node-cache";

import { getOneinchPrice } from "@gnosis.pm/dex-liquidity-provision/scripts/utils/price_utils";

import { getBestAsk } from "api/dexPriceEstimator";

import { useSafeInfo } from "hooks/useSafeInfo";

import { TokenDetails } from "types";
import { Network, ONE_DECIMAL, PRICE_CACHE_TIME } from "utils/constants";

export type PriceSources = "1inch" | "GnosisProtocol";

const cache = new NodeCache({ stdTTL: PRICE_CACHE_TIME });

/**
 * Builds cache key for current token pair and source
 *
 * @param baseToken
 * @param quoteToken
 */
function buildCacheKey(
  source: PriceSources,
  baseToken: TokenDetails,
  quoteToken: TokenDetails
): string {
  return source + baseToken.address + quoteToken.address;
}

function fetchPriceFromCache(key: string): Decimal | null {
  const price = cache.get<Decimal>(key);

  return price ? price : null;
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
 * Fetches prices from Gnosis Protocol
 *
 * Uses bestAsk price from dexPriceEstimator
 * Queries both pairs (A/B and B/A) and returns average to discount spread
 */
async function getGnosisProtocolPrice(
  networkId: number,
  baseToken: TokenDetails,
  quoteToken: TokenDetails
): Promise<Decimal | null> {
  if (
    isNaN(networkId) ||
    isNaN(baseToken.id) ||
    isNaN(quoteToken.id) ||
    baseToken.id === quoteToken.id
  ) {
    return null;
  }

  const [priceBaseInQuote, priceQuoteInBase] = await Promise.all([
    getBestAsk({
      networkId,
      baseTokenId: baseToken.id,
      quoteTokenId: quoteToken.id,
    }),
    getBestAsk({
      networkId,
      baseTokenId: quoteToken.id,
      quoteTokenId: baseToken.id,
    }),
  ]);

  console.log(
    `base price in quote`,
    priceBaseInQuote?.toString(),
    `quote price in base`,
    priceQuoteInBase?.toString()
  );
  // invert opposite price to have it in the same unit
  const priceQuoteInQuote =
    priceQuoteInBase && ONE_DECIMAL.div(priceQuoteInBase);
  console.log(
    `base price in quote`,
    priceBaseInQuote?.toString(),
    `quote price in quote`,
    priceQuoteInQuote?.toString()
  );

  if (priceBaseInQuote && priceQuoteInQuote) {
    // When both prices are present (and second already inverted), return average
    return priceBaseInQuote.add(priceQuoteInQuote).div("2");
  } else if (priceBaseInQuote) {
    // When only base price, return it
    return priceBaseInQuote;
  } else if (priceQuoteInQuote) {
    // When only inverted price, return it
    return priceQuoteInQuote;
  } else {
    // when none, return null
    return null;
  }
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

  const { network } = useSafeInfo();

  const getPrice = useCallback(
    async (params: Required<Params> & { networkId: number }): Promise<void> => {
      const { source, baseToken, quoteToken, networkId } = params;

      // Race condition.
      // Might be that one token is updated before the other, resulting on both
      // base and quote being the same.
      // We don't want to query the price of a token against itself.
      if (baseToken.address === quoteToken.address) {
        return;
      }

      setIsLoading(true);
      setError("");

      const cacheKey = buildCacheKey(source, baseToken, quoteToken);

      let price: Decimal | null = fetchPriceFromCache(cacheKey);

      if (!price) {
        try {
          switch (source) {
            case "1inch": {
              price = await get1InchPrice(baseToken, quoteToken);
              break;
            }
            case "GnosisProtocol": {
              price = await getGnosisProtocolPrice(
                networkId,
                baseToken,
                quoteToken
              );
              break;
            }
          }

          // only store on cache if not `null`
          price && cache.set(cacheKey, price);
        } catch (e) {
          const msg = `Failed to fetch price from '${source}' for '${baseToken.symbol}'/'${quoteToken.symbol}' pair`;
          console.error(msg, e);

          setError(msg);
        }
      }

      setIsLoading(false);
      setPrice(price);
    },
    []
  );

  useEffect((): void => {
    baseToken &&
      quoteToken &&
      getPrice({
        source,
        baseToken,
        quoteToken,
        networkId: Network[network.toLowerCase()],
      });
  }, [source, baseToken, quoteToken, getPrice, network]);

  return { price, isLoading, error };
}
