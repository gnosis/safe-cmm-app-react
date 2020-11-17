import Decimal from "decimal.js";
import NodeCache from "node-cache";

import { getOneinchPrice } from "@gnosis.pm/dex-liquidity-provision/scripts/utils/price_utils";

import { getBestAsk } from "api/dexPriceEstimator";

import { TokenDetails } from "types";

import { ONE_DECIMAL, PRICE_CACHE_TIME } from "utils/constants";

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
  quoteToken: TokenDetails,
  sourceOptions?: Record<string, any>
): string {
  const parts = [source, baseToken.address, quoteToken.address];

  if (source === "GnosisProtocol") {
    // GP prices use average of both sides to account for potentially high spreads
    // Thus, sorting parts make the key the same doesn't matter the token order
    parts.sort();
  }

  const options = sourceOptions
    ? Object.keys(sourceOptions)
        .sort()
        .map((key) => `${key}${sourceOptions[key]}`)
        .join("")
    : "";

  parts.push(options);

  return parts.join("");
}

function fetchPriceFromCache(key: string): Decimal | null {
  const price = cache.get<Decimal>(key);

  return price ? price : null;
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
  quoteToken: TokenDetails,
  options?: { batchId?: number }
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
      batchId: options?.batchId,
    }),
    getBestAsk({
      networkId,
      baseTokenId: quoteToken.id,
      quoteTokenId: baseToken.id,
      batchId: options?.batchId,
    }),
  ]);

  // invert opposite price to have it in the same unit
  const priceQuoteInQuote =
    priceQuoteInBase && ONE_DECIMAL.div(priceQuoteInBase);

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

export interface GetPriceParams {
  source?: PriceSources;
  sourceOptions?: Record<string, any>;
  cacheTime?: number;
  baseToken: TokenDetails;
  quoteToken: TokenDetails;
  networkId: number;
}

/**
 * Fetch price for given token pair from given price source
 */
export async function getPrice(
  params: GetPriceParams
): Promise<Decimal | null> {
  const {
    source = "1inch",
    baseToken,
    quoteToken,
    networkId,
    sourceOptions,
    cacheTime, // By default, results are cached for PRICE_CACHE_TIME. 0 is cache forever
  } = params;

  // Race condition.
  // Might be that one token is updated before the other, resulting on both
  // base and quote being the same.
  // We don't want to query the price of a token against itself.
  if (baseToken.address === quoteToken.address) {
    return null;
  }

  console.log(
    `trying to fetch price for`,
    source,
    baseToken.symbol,
    quoteToken.symbol,
    networkId,
    sourceOptions,
    cacheTime
  );

  const cacheKey = buildCacheKey(source, baseToken, quoteToken, sourceOptions);

  let price: Decimal | null = fetchPriceFromCache(cacheKey);

  if (!price) {
    switch (source) {
      case "1inch": {
        price = await get1InchPrice(baseToken, quoteToken);
        break;
      }
      case "GnosisProtocol": {
        price = await getGnosisProtocolPrice(
          networkId,
          baseToken,
          quoteToken,
          sourceOptions
        );
        break;
      }
    }

    // only store on cache if not `null`
    price && cache.set(cacheKey, price, cacheTime);
  } else {
    console.log(
      `cache hit for `,
      source,
      baseToken.symbol,
      quoteToken.symbol,
      networkId,
      sourceOptions,
      cacheTime
    );
  }

  return price;
}

export type AmountInUsdParams = GetPriceParams & {
  amount?: string;
};

/**
 * Calculates amount in Quote for given amount
 */
export async function amountInQuote(
  params: AmountInUsdParams
): Promise<Decimal | null> {
  const { amount, ...rest } = params;

  if (!amount || isNaN(+amount)) {
    return null;
  }

  const price = await getPrice({ ...rest });

  if (!price) {
    return null;
  }

  return price.mul(amount);
}
