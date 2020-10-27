import PendingStrategy from "logic/pendingStrategy";

import { getPendingTransactions } from "api/safe";
import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";

const findPendingStrategiesForOwner = async (
  context: ContractInteractionContextProps
): Promise<PendingStrategy[]> => {
  const {
    safeInfo: { safeAddress: owner, network },
  } = context;

  const pendingSafeTransactions = await getPendingTransactions(network, owner);

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
