import React from "react";

import { mockTokenDetails } from "./data";
import { TokenDetails } from "types";

import { Web3Context } from "components/Web3Provider";

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

export const mockGetErc20DetailsDecorator = (Story: any): JSX.Element => (
  <Web3Context.Provider value={mockContext}>
    <Story />
  </Web3Context.Provider>
);
