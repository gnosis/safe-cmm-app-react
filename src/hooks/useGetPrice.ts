import { useState, useEffect } from "react";
import Decimal from "decimal.js";

import { useSafeInfo } from "hooks/useSafeInfo";

import { getPrice, GetPriceParams } from "api/prices";

import { Network } from "utils/constants";
import { makeCancellablePromise } from "utils/misc";

type Params = Partial<Omit<GetPriceParams, "networkId">>;

interface Result {
  price: Decimal | null;
  isLoading: boolean;
  error: string;
}

/**
 * Fetches price from given `source`, `baseToken` and `quoteToken`.
 * `price` is `null` when no price is found.
 * `error` is set when an error occurred.
 * `source` defaults to `1inch`.
 */
export function useGetPrice(params: Params): Result {
  const { source = "1inch", baseToken, quoteToken, sourceOptions } = params;

  const [price, setPrice] = useState<Decimal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { network } = useSafeInfo();

  useEffect(() => {
    async function updatePrice(): Promise<void> {
      if (!baseToken || !quoteToken) {
        return;
      }

      setIsLoading(true);
      setError("");

      let newPrice: Decimal | null = null;
      try {
        newPrice = await getPrice({
          source,
          baseToken,
          quoteToken,
          networkId: Network[network.toLowerCase()],
          sourceOptions,
        });
      } catch (e) {
        const msg = `Failed to fetch price from '${source}' for '${baseToken.symbol}'/'${quoteToken.symbol}' pair`;
        console.error(msg, e);
        setError(msg);
      }
      setIsLoading(false);

      setPrice(newPrice);
    }

    const { cancel } = makeCancellablePromise(updatePrice());

    return (): void => cancel();
  }, [source, baseToken, quoteToken, network, sourceOptions]);

  return { price, isLoading, error };
}
