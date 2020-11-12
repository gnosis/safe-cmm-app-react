import { selectorFamily } from "recoil";
import { StrategyStatusEnum } from "types";
import { strategiesByStatusSelector } from "./strategiesByStatus";

/**
 * Returns all strategies of a certain status
 */
export const strategiesOfStatusSelector = selectorFamily({
  key: "strategiesOfStatusSelector",
  get: (status: StrategyStatusEnum) => ({ get }) =>
    get(strategiesByStatusSelector)[status] || [],
});
