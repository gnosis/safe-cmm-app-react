import BN from "bn.js";

import { Bracket } from "logic/IStrategy";
import { DepositEvent } from "logic/types";

export const getFundingPerBracket = (
  depositEvents: DepositEvent[],
  brackets: Bracket[],
  baseTokenAddress: string,
  quoteTokenAddress: string
): Record<string, [BN, BN]> => {
  const depositsByBracket = {};

  depositEvents.forEach((deposit: DepositEvent) => {
    if (!depositsByBracket[deposit.bracketAddress]) {
      depositsByBracket[deposit.bracketAddress] = [];
    }

    depositsByBracket[deposit.bracketAddress].push(deposit);
  });

  const bracketFundings = {};
  brackets.forEach((bracket: Bracket) => {
    const deposits = depositsByBracket[bracket.address];

    if (deposits && deposits.length > 0) {
      const fundingBase = deposits
        .filter(
          (deposit: DepositEvent): boolean => deposit.token === baseTokenAddress
        )
        .reduce(
          (acc, deposit: DepositEvent) => acc.iadd(new BN(deposit.amount)),
          new BN(0)
        );
      const fundingQuote = deposits
        .filter(
          (deposit: DepositEvent): boolean =>
            deposit.token === quoteTokenAddress
        )
        .reduce(
          (acc, deposit: DepositEvent) => acc.iadd(new BN(deposit.amount)),
          new BN(0)
        );

      bracketFundings[bracket.address] = [fundingBase, fundingQuote];
    }
  });

  return bracketFundings;
};
