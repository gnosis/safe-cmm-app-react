import { TokenDetails, Unpromise } from "types";
import { SelectItem } from "@gnosis.pm/safe-react-components/dist/inputs/Select";

/**
 * Uses images from https://github.com/trustwallet/tokens
 */
export function getImageUrl(tokenAddress?: string): string | undefined {
  if (!tokenAddress) return undefined;
  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${tokenAddress}/logo.png`;
}

/**
 * Transforms from TokenDetails instance into a SelectItem instance
 * to be used with <Select> component
 *
 * @param tokenDetails Token details instance
 */
export function tokenDetailsToSelectItem(
  tokenDetails: TokenDetails
): SelectItem {
  return {
    id: tokenDetails.address,
    label: tokenDetails.symbol,
    iconUrl: tokenDetails.imageUrl,
  };
}

/**
 * Wrapper for async functions, try/catching errors and returning default value on failure
 *
 * @param fn Async function to be executed
 * @param defaultOnFailure Default value to return in case of failure
 * @param params Async function params
 */
export async function safeAsyncFn<
  Fn extends (...args: any[]) => Promise<any>,
  D
>(
  fn: Fn,
  defaultOnFailure: D,
  ...params: Parameters<Fn>
): Promise<Unpromise<ReturnType<Fn>> | D> {
  try {
    return await fn(...params);
  } catch (e) {
    console.log(`Failed to execute fn`, e);
    return defaultOnFailure;
  }
}

/**
 * Function to create cancellable promises
 *
 * TS version of https://github.com/wojtekmaj/make-cancellable-promise/blob/master/src/index.js
 *
 * @param promise: Promise to make cancellable
 */
export function makeCancellablePromise<T>(
  promise: Promise<T>
): { promise: Promise<T>; cancel: () => void } {
  let isCancelled = false;

  const wrappedPromise = new Promise<T>((resolve, reject) => {
    promise
      .then((...args) => !isCancelled && resolve(...args))
      .catch((error) => !isCancelled && reject(error));
  });

  return {
    promise: wrappedPromise,
    cancel() {
      isCancelled = true;
    },
  };
}
