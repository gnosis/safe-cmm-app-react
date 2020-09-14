import { useTokenBalance as useTokenBalanceHook } from "hooks/useTokenBalance";
import { createMockHook } from "./mockHookContext";

/**
 * Mock version of `useTokenBalance` hook.
 *
 * Customizable via story parameters, such as:
 *
 * MyStory.parameters = {
 *  useTokenBalance: {
 *    price: new BN('13319023810'),
 *    isLoading: true,
 *    error: 'Something went wrong'
 *  }
 * or
 *  useTokenBalance: (...argsPassedToHook) => ({
 *    price: new BN('13319023810'),
 *    isLoading: true,
 *    error: 'Something went wrong'
 *  })
 * }
 */
export const useTokenBalance = createMockHook<typeof useTokenBalanceHook>(
  "useTokenBalance",
  { balance: null, isLoading: false, error: "" }
);
