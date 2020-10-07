import { useAmountInUsd as hook } from "hooks/useAmountInUsd";
import { createMockHook } from "./mockHookContext";

/**
 * Mock version of `useAmountInUsd` hook
 *
 * Customizable via story parameters, such as:
 *
 * MyStory.parameters = {
 *  useAmountInUsd: {
 *    amountInUsd: new Decimal('13'),
 *    isLoading: true,
 *    error: 'Something went wrong'
 *  }
 * or
 *  useAmountInUsd: (...argsPassedToHook) => ({
 *    amountInUsd: new Decimal('13'),
 *    isLoading: true,
 *    error: 'Something went wrong'
 *  })
 * }
 */
export const useAmountInUsd = createMockHook<typeof hook>("useAmountInUsd", {
  amountInUsd: null,
  isLoading: false,
  error: "",
});
