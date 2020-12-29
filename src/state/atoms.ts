import { atom, atomFamily, selectorFamily } from "recoil";
import localforage from "localforage";
import BN from "bn.js";

import {
  LoadingState,
  StrategyState,
  TokenDetails,
  TradesState,
  WithdrawState,
} from "types";
import { Trade } from "api/web3/trades";

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
    let state = { trades: [], lastCheckedBlock: 0 };
    try {
      // Lazy load from local storage, if any
      const storedState = await localforage.getItem<TradesState>(key);
      logger.log(`State for key '${key}'`, storedState);
      state = storedState || state;
    } catch (e) {
      // No worries, use default
      logger.warn(`Failed to fetch stored state for key ${key}`);
    }
    return state;
  },
  effects_UNSTABLE: (txHash: string) => [
    ({ onSet }): void =>
      onSet((state) => console.debug(`new trades state ${txHash}`, state)),
    ({ onSet }): void =>
      onSet((state) =>
        localforage.setItem(
          getStorageKey(txHash, "trades"),
          state,
          (err, value) =>
            console.debug(`stored 'trades|${txHash}':`, err, value)
        )
      ),
  ],
});

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
