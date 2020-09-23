import { useGetPrice as useGetPriceHook } from "hooks/useGetPrice";
import { createMockHook } from "./mockHookContext";

/**
 * Mock version of `useGetPrice` hook.
 *
 * Customizable via story parameters, such as:
 *
 * MyStory.parameters = {
 *  useGetPrice: {
 *    price: new Decimal('13'),
 *    isLoading: true,
 *    error: 'Something went wrong'
 *  }
 * or
 *  useGetPrice: (...argsPassedToHook) => ({
 *    price: new Decimal('13'),
 *    isLoading: true,
 *    error: 'Something went wrong'
 *  })
 * }
 */
export const useGetPrice = createMockHook<typeof useGetPriceHook>(
  "useGetPrice",
  { price: null, isLoading: false, error: "" }
);
