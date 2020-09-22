import { Web3Context } from "types";
import PendingStrategy from "logic/pendingStrategy";

import { getPendingTransactions } from "api/safe"

const findPendingStrategiesForOwner = async (
  context: Web3Context
): Promise<PendingStrategy[]> => {
  const {
    safeInfo: { safeAddress: owner },
    getDeployed,
  } = context;

  const pendingSafeTransactions = await getPendingTransactions(owner);
  console.log(pendingSafeTransactions)

  const strategies: PendingStrategy[] = await Promise.all(
    pendingSafeTransactions.map(
      async (pendingSafeTransaction : any): Promise<PendingStrategy> => {
        const strategy = new PendingStrategy(pendingSafeTransaction);

        await strategy.findFromPendingTransactions(context);
        return strategy;
      }
    )
  );

  return strategies;
};

export default findPendingStrategiesForOwner;
