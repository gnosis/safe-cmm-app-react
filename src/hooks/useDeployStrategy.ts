import { useContext } from "react";
import BN from "bn.js";

import { parseAmount } from "@gnosis.pm/dex-js";

import { Web3Context } from "components/Web3Provider";
import deployStrategy from "api/deployStrategy";

import { useTokenDetails } from "hooks/useTokenDetails";
import Decimal from "decimal.js";

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
  params: Omit<Params, "baseTokenAddress" | "quoteTokenAddress">
) => Promise<void>;

function priceToBnWhyNotDecimalInstead(price: string): BN {
  return new BN(new Decimal(price).mul(1e18).toString());
}

export function useDeployStrategy(
  params: Pick<Params, "baseTokenAddress" | "quoteTokenAddress">
): Return {
  const { baseTokenAddress, quoteTokenAddress } = params;

  const web3Context = useContext(Web3Context);
  const { tokenDetails: baseTokenDetails } = useTokenDetails(baseTokenAddress);
  const { tokenDetails: quoteTokenDetails } = useTokenDetails(
    quoteTokenAddress
  );

  return async (params): Promise<void> => {
    const {
      lowestPrice,
      highestPrice,
      baseTokenAmount,
      quoteTokenAmount,
      totalBrackets,
      startPrice,
    } = params;
    console.log(`Params`, params);

    await deployStrategy(
      web3Context,
      +totalBrackets,
      // addresses
      baseTokenAddress,
      quoteTokenAddress,
      // prices
      priceToBnWhyNotDecimalInstead(lowestPrice),
      priceToBnWhyNotDecimalInstead(highestPrice),
      // amounts
      parseAmount(baseTokenAmount, baseTokenDetails.decimals),
      parseAmount(quoteTokenAmount, quoteTokenDetails.decimals),
      // start price
      priceToBnWhyNotDecimalInstead(startPrice)
    );
  };
}
