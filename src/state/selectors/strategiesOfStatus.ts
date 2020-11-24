import { sortBy } from "lodash";
import { selectorFamily } from "recoil";
import { StrategyState, StrategyStatusEnum } from "types";
import { strategiesByStatusSelector } from "./strategiesByStatus";

/**
 * Returns all strategies of a certain status
 */
export const strategiesOfStatusSelector = selectorFamily({
  key: "strategiesOfStatusSelector",
  get: (statusOrStatuses: StrategyStatusEnum | StrategyStatusEnum[]) => ({
    get,
  }) => {
    let strategies = [];
    if (Array.isArray(statusOrStatuses)) {
      (statusOrStatuses as StrategyStatusEnum[]).forEach((status) => {
        strategies = [
          ...strategies,
          ...(get(strategiesByStatusSelector)[status] || []),
        ];
      });
    } else {
      strategies = get(strategiesByStatusSelector)[statusOrStatuses] || [];
    }

    // Sort by creation date
    return sortBy(strategies, (o: StrategyState): number => {
      return o.created.valueOf();
    }).reverse();
  },
});
