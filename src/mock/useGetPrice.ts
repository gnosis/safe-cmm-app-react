import Decimal from "decimal.js";

import { useGetPrice as useGetPriceHook } from "hooks/useGetPrice";
import { Parameters as StoryParameters, StoryContext } from "@storybook/react";

let price: null | Decimal = null;
let isLoading = false;
let error = "";

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
 * }
 */
export function useGetPrice(
  ...[params]: Parameters<typeof useGetPriceHook>
): ReturnType<typeof useGetPriceHook> {
  return {
    price: !params.baseToken || !params.quoteToken ? null : price,
    isLoading,
    error,
  };
}

interface UseGetPriceStoryParameters {
  price?: Decimal;
  isLoading?: boolean;
  error?: string;
}

interface ExtendedContext extends StoryContext {
  parameters: StoryParameters & { useGetPrice?: UseGetPriceStoryParameters };
}

/**
 * Storybook decorator
 */
export function decorator(
  story: any,
  { parameters: { useGetPrice } }: ExtendedContext
): any {
  price = useGetPrice?.price || null;
  isLoading = useGetPrice?.isLoading || false;
  error = useGetPrice?.error || "";

  return story();
}
