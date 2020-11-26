import { SafeInfo } from "@gnosis.pm/safe-apps-sdk";
import { useContext } from "react";

import { ContractInteractionContext } from "components/context/ContractInteractionProvider";

/**
 * Syntactic sugar to get the safe info without messing with the context.
 *
 * Keep in mind it'll still probably be updated when anything in the context updates.
 */
export function useSafeInfo(): SafeInfo {
  const { safeInfo } = useContext(ContractInteractionContext);

  return safeInfo;
}
