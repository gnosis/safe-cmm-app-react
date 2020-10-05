import { Web3Context } from "types";
import PendingStrategy from "logic/pendingStrategy";

import { getPendingTransactions } from "api/safe";

const findPendingStrategiesForOwner = async (
  context: Web3Context
): Promise<PendingStrategy[]> => {
  const {
    safeInfo: { safeAddress: owner },
  } = context;

  const pendingSafeTransactions = await getPendingTransactions(owner);

  const strategies: PendingStrategy[] = await Promise.all(
    pendingSafeTransactions
      .filter((pendingSafeTransaction: any) =>
        PendingStrategy.isPendingStrategyTx(pendingSafeTransaction)
      )
      .map(
        async (pendingSafeTransaction: any): Promise<PendingStrategy> => {
          const strategy = new PendingStrategy(pendingSafeTransaction);

          await strategy.findFromPendingTransactions(context);
          return strategy;
        }
      )
  );

  return strategies;
};

export default findPendingStrategiesForOwner;
