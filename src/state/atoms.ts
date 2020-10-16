import { atom } from "recoil";
import BN from "bn.js";

export const tokenBalancesState = atom<Record<string, BN>>({
  key: "tokenBalances",
  default: {},
});
