import { useTokenBalance as useTokenBalanceHook } from "hooks/useTokenBalance";
import { Parameters as StoryParameters, StoryContext } from "@storybook/react";
import BN from "bn.js";

let balance: null | BN = null;
let isLoading = false;
let error = "";

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
 * }
 */
export function useTokenBalance(
  ...[address]: Parameters<typeof useTokenBalanceHook>
): ReturnType<typeof useTokenBalanceHook> {
  return {
    balance: !address ? null : balance,
    isLoading,
    error,
  };
}

interface UseTokenBalanceStoryParameters {
  balance?: BN;
  isLoading?: boolean;
  error?: string;
}

interface ExtendedContext extends StoryContext {
  parameters: StoryParameters & {
    useTokenBalance?: UseTokenBalanceStoryParameters;
  };
}

/**
 * Storybook decorator
 */
export function decorator(
  story: any,
  { parameters: { useTokenBalance } }: ExtendedContext
): any {
  balance = useTokenBalance?.balance || null;
  isLoading = useTokenBalance?.isLoading || false;
  error = useTokenBalance?.error || "";

  return story();
}
