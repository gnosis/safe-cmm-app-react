import { useContext } from "react";
import BN from "bn.js";

import { parseAmount } from "@gnosis.pm/dex-js";

import { Web3Context } from "components/Web3Provider";
import deployStrategy from "api/deployStrategy";

import { useTokenDetails } from "hooks/useTokenDetails";

export interface Params {
  lowestPrice: string;
  highestPrice: string;
  baseTokenAmount: string;
  quoteTokenAmount: string;
  totalBrackets: string;
  baseTokenAddress: string;
  quoteTokenAddress: string;
  startPrice: string;
}

export type Return = (
  params: Omit<Params, "baseTokenAddress">
) => Promise<void>;

export function useDeployStrategy(
  params: Pick<Params, "baseTokenAddress">
): Return {
  const { baseTokenAddress } = params;

  const web3Context = useContext(Web3Context);
  const { tokenDetails: baseTokenDetails } = useTokenDetails(baseTokenAddress);

  // simple validation
  // if (
  //   !lowestPrice ||
  //   !highestPrice ||
  //   !startPrice ||
  //   !baseTokenAmount ||
  //   !quoteTokenAmount ||
  //   !totalBrackets ||
  //   !baseTokenAddress ||
  //   !quoteTokenAddress ||
  //   !baseTokenDetails ||
  //   !quoteTokenDetails
  // ) {
  //   return null;
  // }

  return async (params): Promise<void> => {
    const {
      lowestPrice,
      highestPrice,
      baseTokenAmount,
      quoteTokenAmount,
      totalBrackets,
      quoteTokenAddress,
      startPrice,
    } = params;

    await deployStrategy(
      web3Context,
      +totalBrackets,
      baseTokenAddress,
      quoteTokenAddress,
      parseAmount(lowestPrice, baseTokenDetails.decimals),
      parseAmount(highestPrice, baseTokenDetails.decimals),
      new BN(baseTokenAmount),
      new BN(quoteTokenAmount),
      new BN(startPrice)
    );
  };
}
