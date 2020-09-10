import { useTokenList as useTokenListHook } from "hooks/useTokenList";

import { mockTokenDetails } from "./data";

export const useTokenList = (): ReturnType<typeof useTokenListHook> =>
  Object.values(mockTokenDetails);
