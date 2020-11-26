import { selectorFamily } from "recoil";
import { strategiesState } from "state/atoms";
import { StrategyState } from "types";

export const strategySelector = selectorFamily({
  key: "strategyStateSelector",
  get: (txHash: string) => ({ get }) => get(strategiesState)[txHash],
  set: (txHash: string) => ({ set }, newValue: StrategyState) =>
    set(strategiesState, (prevState) => ({
      ...prevState,
      [txHash]: {
        ...prevState[txHash],
        ...newValue,
      },
    })),
});
