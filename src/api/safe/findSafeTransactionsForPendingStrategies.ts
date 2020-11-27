import { getPendingTransactions } from "api/safe";
import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";

export const findSafeTransactionsForPendingStrategies = async (
  context: ContractInteractionContextProps
): Promise<any[]> => {
  const {
    safeInfo: { safeAddress: owner, network },
  } = context;
  const pendingSafeTransactions = await getPendingTransactions(network, owner);

  const strategies: any[] = await Promise.all(
    pendingSafeTransactions.filter((pendingSafeTransaction: any) => {
      // FIXME: Sorry, this is awful. Needs to be fixed later.
      // Either implement the walkTransaction as a generic tx graph class, or come
      // up with something cooler.
      const txDataStr = JSON.stringify(pendingSafeTransaction.dataDecoded);

      return (
        txDataStr.includes("placeOrder") ||
        txDataStr.includes("deployFleet") ||
        txDataStr.includes("deployFleetWithNonce")
      );
    })
  );

  return strategies;
};
