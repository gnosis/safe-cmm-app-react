import { useTokenList as useTokenListHook } from "hooks/useTokenList";

import { mockTokenDetails } from "./data";

export const useTokenList: typeof useTokenListHook = () =>
  Object.values(mockTokenDetails);
