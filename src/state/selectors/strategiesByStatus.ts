import { selector } from "recoil";
import { strategiesState } from "state/atoms";

/**
 * Returns strategies grouped by their status
 */
export const strategiesByStatusSelector = selector({
  key: "strategiesByStatus",
  get: ({ get }) => {
    const strategies = {};

    const strategiesByTxHash = get(strategiesState);
    Object.keys(strategiesByTxHash).forEach((txHash) => {
      const strategyState = strategiesByTxHash[txHash];

      if (!strategies[strategyState.status]) {
        strategies[strategyState.status] = [];
      }

      strategies[strategyState.status].push(strategyState);
    });

    return strategies;
  },
});
