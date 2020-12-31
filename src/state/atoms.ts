import { atom, atomFamily, selectorFamily } from "recoil";
import BN from "bn.js";

import {
  LoadingState,
  StrategyState,
  TokenDetails,
  TradesState,
  WithdrawState,
} from "types";

import { Trade } from "api/web3/trades";
import storage from "api/storage";

import getLoggerOrCreate from "utils/logger";

const logger = getLoggerOrCreate("recoil state");

export const tokenBalancesState = atom<Record<string, BN>>({
  key: "tokenBalances",
  default: {},
});

// TODO: terrible name, find a better one
export const withdrawStatesState = atom<Record<string, WithdrawState>>({
  key: "withdrawStatesState",
  default: {},
});

export const strategiesState = atom<Record<string, StrategyState>>({
  key: "strategies",
  default: {},
});

export const strategiesLoadingState = atom<LoadingState>({
  key: "strategiesLoadingState",
  default: "LOADING",
});

export const tokenDetailsState = atom<Record<string, TokenDetails>>({
  key: "tokenDetails",
  default: {},
});

function getStorageKey(txHash: string, type: "trades" | "strategy"): string {
  return `${txHash}|${type}`;
}

export const strategyTradesStateFamily = atomFamily<TradesState, string>({
  key: "tradesState",
  default: async (txHash: string): Promise<TradesState> => {
    const key = getStorageKey(txHash, "trades");

    // Default empty state
    let state: TradesState = { trades: [], lastCheckedBlock: 0 };
    try {
      // Lazy load from local storage, if any
      const storedState = await storage.getItem<TradesState>(key);
      state = storedState || state;
    } catch (e) {
      // No worries, use default
      logger.warn(`Failed to fetch stored state for key ${key}`);
    }
    return state;
  },
  effects_UNSTABLE: (txHash: string) => [
    ({ onSet }): void =>
      onSet((state) =>
        storage.setItem(
          getStorageKey(txHash, "trades"),
          state,
          (err, value) =>
            err &&
            logger.warn(
              `Failed to store '${getStorageKey(txHash, "trades")}':`,
              value,
              err
            )
        )
      ),
  ],
});

/**
 * Syntactic sugar to read/write only trades, event though it's part of
 * a single TradesState object
 */
export const tradesSelector = selectorFamily<Trade[], string>({
  key: "trades",
  get: (txHash: string) => ({ get }) =>
    get(strategyTradesStateFamily(txHash)).trades,
  set: (txHash: string) => ({ get, set }, trades): void => {
    const tradesStateAtom = strategyTradesStateFamily(txHash);
    const tradesState = get(tradesStateAtom);

    set(tradesStateAtom, { ...tradesState, trades });
  },
});

/**
 * Syntactic sugar to read/write only lastCheckedBlock, event though it's part of
 * a single TradesState object
 */
export const lastCheckedBlockSelector = selectorFamily<number, string>({
  key: "lastCheckedBlock",
  get: (txHash: string) => ({ get }) =>
    get(strategyTradesStateFamily(txHash)).lastCheckedBlock,
  set: (txHash: string) => ({ get, set }, lastCheckedBlock): void => {
    const tradesStateAtom = strategyTradesStateFamily(txHash);
    const tradesState = get(tradesStateAtom);

    // Only update state if changed
    if (lastCheckedBlock !== tradesState.lastCheckedBlock) {
      set(tradesStateAtom, { ...tradesState, lastCheckedBlock });
    }
  },
});
