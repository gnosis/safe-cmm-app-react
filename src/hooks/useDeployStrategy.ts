import { useContext } from "react";
import { FORM_ERROR } from "final-form";

import { parseAmount, ZERO } from "@gnosis.pm/dex-js";

import deployStrategy from "api/deployStrategy";
import getLogger from "utils/logger";

import { priceToBn } from "utils/misc";

import { ValidationErrors } from "validators/types";
import { ContractInteractionContext } from "components/context/ContractInteractionProvider";

const logger = getLogger("useDeployStrategy");

export interface Params {
  baseTokenAddress: string;
  quoteTokenAddress: string;

  lowestPrice: string;
  startPrice: string;
  highestPrice: string;

  baseTokenAmount: string;
  quoteTokenAmount: string;

  totalBrackets: string;
}

export type Result = (params: Params) => Promise<undefined | ValidationErrors>;

export function useDeployStrategy(): Result {
  const context = useContext(ContractInteractionContext);
  const { getErc20Details } = context;

  return async (fnParams: Params) => {
    const {
      baseTokenAddress,
      quoteTokenAddress,
      lowestPrice,
      startPrice,
      highestPrice,
      baseTokenAmount,
      quoteTokenAmount,
      totalBrackets,
    } = fnParams;

    const [baseToken, quoteToken] = await Promise.all([
      getErc20Details(baseTokenAddress),
      getErc20Details(quoteTokenAddress),
    ]);

    if (!baseToken || !quoteToken) {
      return {
        [FORM_ERROR]: {
          label: "Failed to submit",
          children: "Couldn't load required token data",
        },
      };
    }

    logger.log(
      `==> Will deploy strategy with values:`,
      Object.keys(fnParams).map((k) => `${k}:${fnParams[k]}`),
      baseToken,
      quoteToken
    );

    try {
      await deployStrategy(
        context,
        Number(totalBrackets),
        // addresses
        baseTokenAddress,
        quoteTokenAddress,
        // prices
        priceToBn(lowestPrice),
        priceToBn(highestPrice),
        // amounts
        parseAmount(baseTokenAmount, baseToken.decimals) || ZERO,
        parseAmount(quoteTokenAmount, quoteToken.decimals) || ZERO,
        // start price
        priceToBn(startPrice)
      );

      logger.log(`==> Successfully deployed strategy`);

      // success
      return undefined;
    } catch (e) {
      console.error(e);
      return {
        [FORM_ERROR]: {
          label: "Failed to deploy strategy",
          children: e.message,
        },
      };
    }
  };
}
