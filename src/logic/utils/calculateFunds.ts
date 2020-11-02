import Decimal from "decimal.js";
import BN from "bn.js";

import find from "lodash/find";
import { TokenDetails } from "types";

/**
 * Price entry abstraction for entries from `Strategy` and `PendingStrategy`.
 * Pending Strategy uses Transaction arguments
 * Active Strategies use Event logs
 * This interface abstracts both into one interface
 */
export interface PriceEntry {
  baseTokenId: number; // "buyToken"
  quoteTokenId: number; // "sellToken"
  baseTokenPrice: string; // "buyAmount", "priceNumerator"
  quoteTokenPrice: string; // "sellAmount", "priceDenominator "
}

export interface PriceRange {
  lower: Decimal;
  upper: Decimal;
  token: TokenDetails;
}

export interface FundingDetails {
  bracketPrices: Decimal[];
  baseTokenId: number;
  quoteTokenId: number;
  primaryFunding: BN;
  quoteFunding: BN;
  bracketAddresses: string[];
  bracketTokenBalances: any;
  bracketsByToken: any;
}

const decimalSorter = (a: Decimal, b: Decimal): number => {
  if (a.eq(b)) return 0;
  return a.gt(b) ? 1 : -1;
};

export const pricesToRange = (
  bracketPrices: Decimal[],
  baseTokenDetails: TokenDetails,
  quoteTokenDetails: TokenDetails
): PriceRange => {
  if (!bracketPrices.length) {
    return null;
  }

  bracketPrices.sort(decimalSorter);

  const firstPrice = bracketPrices[0];
  const lastPrice = bracketPrices[bracketPrices.length - 1];

  const lower = firstPrice.div(
    new Decimal(
      Math.pow(10, quoteTokenDetails.decimals - baseTokenDetails.decimals)
    )
  );

  const upper = lastPrice.div(
    new Decimal(
      Math.pow(10, quoteTokenDetails.decimals - baseTokenDetails.decimals)
    )
  );

  return {
    lower,
    upper,
    token: quoteTokenDetails,
  };
};

export const calculateFundsFromEvents = (
  bracketOrderEvents: any[],
  bracketAddresses: string[]
): FundingDetails => {
  const firstBracketEvent = bracketOrderEvents[0];
  const baseToken = firstBracketEvent.returnValues.buyToken;
  const quoteToken = firstBracketEvent.returnValues.sellToken;

  const bracketPrices = [];

  bracketOrderEvents.forEach((bracketOrder) => {
    if (bracketOrder.returnValues.buyToken === baseToken) {
      bracketPrices.push(
        new Decimal(bracketOrder.returnValues.priceDenominator).div(
          new Decimal(bracketOrder.returnValues.priceNumerator)
        )
      );
    }
    if (bracketOrder.returnValues.buyToken === quoteToken) {
      bracketPrices.push(
        new Decimal(bracketOrder.returnValues.priceNumerator).div(
          new Decimal(bracketOrder.returnValues.priceDenominator)
        )
      );
    }
  });

  return {
    bracketPrices,
    baseTokenId: baseToken,
    quoteTokenId: quoteToken,
    primaryFunding: null,
    quoteFunding: null,
    bracketAddresses,
    bracketTokenBalances: null,
    bracketsByToken: null,
  };
};

/**
 * Helper interfaces to correctly type tx-tree entries
 */
interface DecoderValue {
  operation: number;
  to: string;
  value: number;
  data: string;
  dataDecoded: DecoderData;
}

interface DecoderParameter {
  name: string;
  type: string;
  value: string;
  valueDecoded: DecoderValue[] | DecoderData;
}

export interface DecoderData {
  method: string;
  parameters: DecoderParameter[];
}

interface TxTreeNode {
  data: DecoderData | DecoderParameter | DecoderValue;
  parent: TxTreeNode;
}

export const calculateFundsFromTxData = (
  txDataRoot: DecoderData
): FundingDetails => {
  const sumFundingTokenBase = new BN(0);
  const sumFundingTokenQuote = new BN(0);

  let tokenIdBase;
  let tokenIdQuote;

  const prices = [];

  const bracketAddresses = [];

  if (txDataRoot.method !== "multiSend") {
    throw new Error("Expected multiSend to handle pending transaction walking");
  }

  const bracketTokenBalances = {};

  // let depth = 0

  // This function is responsible for "walking" down the transaction graph.
  // The reason I consider the structure a graph is because of mutliSend there can be
  // deeply nested transactions. DecoderNode includes a parent ref to traverse the tree up again.
  const walkTransaction = (node: TxTreeNode): void => {
    // depth++;
    //console.log(`${"  ".repeat(depth)}==> Walking "${txData.method}" with ${txData.parameters.length} params`)
    const txData = node.data as DecoderData;

    if (txData.method === "placeOrder") {
      // logger.log('Reading decoded placeOrder', txData);
      // In placeOrder events we will find the buyToken/sellToken, the buy/sellAmounts (prices)
      // and if we collect the `to` addresses, the bracket addresses.

      // Find buy and sell token. The first occurrences will be used to determine base/quote
      // FIXME: I don't know how reliable this will be - it's an assumption that might be wrong
      //        It might be possible to compare this with current prices for this token pair
      //        and to do a sanity check if the prices are clsoe enough?
      const tokenIdBuy = find(txData.parameters, { name: "buyToken" })?.value;
      const tokenIdSell = find(txData.parameters, { name: "sellToken" })?.value;
      if (tokenIdBase == null && tokenIdQuote == null) {
        tokenIdBase = tokenIdBuy;
        tokenIdQuote = tokenIdSell;
      }

      // Amounts to sell and buy in eth-wei
      const sellAmount =
        find(txData.parameters, { name: "buyAmount" })?.value || "0";
      const buyAmount =
        find(txData.parameters, { name: "sellAmount" })?.value || "0";
      // Check to see if we sum onto base/quote depending on which tokenId we have
      if (tokenIdBase === tokenIdBuy) {
        prices.push(new Decimal(buyAmount).div(sellAmount));
        sumFundingTokenBase.iadd(new BN(buyAmount));
        sumFundingTokenQuote.iadd(new BN(sellAmount));
      } else {
        prices.push(new Decimal(sellAmount).div(buyAmount));
        sumFundingTokenBase.iadd(new BN(sellAmount));
        sumFundingTokenQuote.iadd(new BN(buyAmount));
      }

      // Collect bracket address, as this transaction will be executed from a bracket
      const bracketAddress = (node.parent.parent.parent.data as DecoderValue) // placeOrder // execTransaction param // multiSend param
        .to;
      if (!bracketAddresses.includes(bracketAddress))
        bracketAddresses.push(bracketAddress);
    }

    if (txData.method === "transfer") {
      const bracketAddress =
        find(txData.parameters, { name: "to" })?.value || "0x0";
      const tokenAmount =
        find(txData.parameters, { name: "value" })?.value || "0";

      const tokenAddress = (node.parent.data as DecoderValue).to;

      if (!bracketTokenBalances[bracketAddress]) {
        bracketTokenBalances[bracketAddress] = {};
      }

      if (!bracketTokenBalances[bracketAddress][tokenAddress]) {
        bracketTokenBalances[bracketAddress][tokenAddress] = new BN(0);
      }

      bracketTokenBalances[bracketAddress][tokenAddress].iadd(
        new BN(tokenAmount)
      );
    }

    txData.parameters.forEach((parameter: DecoderParameter): void => {
      if (parameter != null && parameter.valueDecoded != null) {
        //console.log(parameter.valueDecoded)

        if (Array.isArray(parameter.valueDecoded)) {
          // If valueDecoded is an Array, treat as Decode_Value
          parameter.valueDecoded.forEach(
            (parameterValue: DecoderValue): void => {
              if (parameterValue && parameterValue.dataDecoded != null) {
                walkTransaction({
                  data: parameterValue.dataDecoded,
                  parent: {
                    data: parameterValue,
                    parent: node,
                  },
                });
              }
            }
          );
        } else {
          // if valueDecoded is no array, it's Decode_Data
          if (parameter.valueDecoded && parameter.valueDecoded.parameters) {
            walkTransaction({
              data: parameter.valueDecoded as DecoderData,
              parent: {
                data: parameter,
                parent: node,
              },
            });
          }
        }
      }
    });
    // depth--;
  };

  walkTransaction({
    data: txDataRoot,
    parent: null,
  });

  const bracketsByToken = Object.keys(bracketTokenBalances).reduce(
    (acc, bracketAddress): any => {
      const tokenBalances = bracketTokenBalances[bracketAddress];
      const tokens = Object.keys(tokenBalances);

      tokens.forEach((tokenAddress) => {
        if (!acc[tokenAddress]) {
          acc[tokenAddress] = {};
        }

        if (!acc[tokenAddress][bracketAddress]) {
          acc[tokenAddress][bracketAddress] = new BN(0);
        }
        acc[tokenAddress][bracketAddress].iadd(
          new BN(tokenBalances[tokenAddress])
        );
      });
      return acc;
    },
    {}
  );

  return {
    bracketPrices: prices,
    baseTokenId: tokenIdBase,
    quoteTokenId: tokenIdQuote,
    primaryFunding: sumFundingTokenBase,
    quoteFunding: sumFundingTokenQuote,
    bracketAddresses: bracketAddresses,
    bracketTokenBalances,
    bracketsByToken,
  };
};
