import { selector, selectorFamily } from "recoil";
import { strategiesState } from "state/atoms";
import { StrategyStatusEnum } from "types";
import { strategiesByStatusSelector } from "./strategiesByStatus";

/**
 * Returns the amount of strategies the UI will display
 *
 * Will ignore INCOMPLETE, CLOSED and UNKNOWN Strategies
 */
export const totalStrategyCount = selector({
  key: "totalStrategyCount",
  get: ({ get }) => {
    const strategiesByTxHash = get(strategiesState);

    return Object.keys(strategiesByTxHash).filter((txHash) =>
      ["PENDING", "ACTIVE", "TRADING_STOPPED"].includes(
        strategiesByTxHash[txHash].status
      )
    ).length;
  },
});

export const strategyCountByStatus = selectorFamily({
  key: "strategyCountByStatus",
  get: (status: StrategyStatusEnum) => ({ get }) => {
    const strategiesByStatus = get(strategiesByStatusSelector);

    return (strategiesByStatus[status] || []).length;
  },
});
