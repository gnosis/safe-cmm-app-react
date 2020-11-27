import { atom } from "recoil";
import BN from "bn.js";

import {
  LoadingState,
  StrategyState,
  TokenDetails,
  WithdrawState,
} from "types";

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
