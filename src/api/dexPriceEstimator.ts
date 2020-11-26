import Decimal from "decimal.js";

import { assert } from "@gnosis.pm/dex-js";

import { DEX_PRICE_ESTIMATOR_URLS } from "utils/constants";

type GetBestAskParams = {
  networkId: number;
  baseTokenId: number;
  quoteTokenId: number;
  batchId?: number;
};

export async function getBestAsk(
  params: GetBestAskParams
): Promise<Decimal | null> {
  const { networkId, baseTokenId, quoteTokenId, batchId } = params;

  // Query format: markets/7-1/estimated-best-ask-price?unit=baseunits&roundingBuffer=enabled&batchId=5350588
  const queryString = `markets/${baseTokenId}-${quoteTokenId}/estimated-best-ask-price${
    batchId !== undefined ? `?batchId=${batchId}` : ""
  }`;

  try {
    const response = await query<number>(networkId, queryString);

    if (response === null) {
      return null;
    }

    return new Decimal(response);
  } catch (e) {
    console.error(e);
    throw new Error(
      `Failed to query best ask for baseToken id ${baseTokenId} quoteToken id ${quoteTokenId}: ${e.message}`
    );
  }
}

async function query<T>(
  networkId: number,
  queryString: string
): Promise<T | null> {
  const baseUrl = getBaseUrl(networkId);

  const url = baseUrl + queryString;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed: [${response.status}] ${response.body}`);
  }

  const body = await response.text();

  if (!body) {
    return null;
  }

  return JSON.parse(body);
}

function getBaseUrl(networkId: number): string {
  const baseUrl = DEX_PRICE_ESTIMATOR_URLS[networkId];
  assert(
    baseUrl,
    `Dex-price-estimator not available for network id ${networkId}`
  );

  return baseUrl + "/api/v1/";
}
