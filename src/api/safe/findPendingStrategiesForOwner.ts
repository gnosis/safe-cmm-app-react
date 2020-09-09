import { Web3Context } from "types";
import PendingStrategy from "logic/PendingStrategy";

import api from "./"

const findPendingStrategiesForOwner = async (
  context: Web3Context
): Promise<PendingStrategy[]> => {
  const {
    safeInfo: { safeAddress: owner },
    getDeployed,
  } = context;

  const pendingSafeTransactions = await api.getPendingTransations(owner);
  console.log(pendingSafeTransactions)

  const strategies: PendingStrategy[] = await Promise.all(
    fleetDeployEvents.map(
      async (fleetDeployEvent): Promise<PendingStrategy> => {
        const strategy = new PendingStrategy(fleetDeployEvent);

        await strategy.fetchAllPossibleInfo(context);
        return strategy;
      }
    )
  );

  return strategies;
};

export default findPendingStrategiesForOwner;
