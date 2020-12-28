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

export const strategyTradesStateFamily = atomFamily<TradesState, string>({
  key: "tradesState",
  default: { trades: [], lastCheckedBlock: 0 }, // TODO: try local storage first
  effects_UNSTABLE: (txHash: string) => [
    ({ onSet }): void =>
      onSet((state) =>
        console.debug(`new trades state saved ${txHash}`, state)
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

    set(tradesStateAtom, { ...tradesState, lastCheckedBlock });
  },
});
