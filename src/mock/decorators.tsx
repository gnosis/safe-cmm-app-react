import React from "react";

import { mockTokenDetails } from "./data";
import { TokenDetails } from "types";

import { TokenInteractionContext } from "components/context/TokenInteractionProvider";

const mockContext = {
  getErc20Details: async (address: string): Promise<TokenDetails> => {
    return (
      mockTokenDetails?.[address] || {
        decimals: 18,
        name: "same",
        symbol: "TKN",
        address: address,
      }
    );
  },
};

/**
 * Example on how to mock context provider as a decorator for stories.
 * No longer in use.
 */
export const mockGetErc20DetailsDecorator = (Story: any): JSX.Element => (
  <TokenInteractionContext.Provider value={mockContext}>
    <Story />
  </TokenInteractionContext.Provider>
);
