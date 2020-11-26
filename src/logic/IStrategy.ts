import Decimal from "decimal.js";
import BN from "bn.js";

import { TokenDetails } from "types";
import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";

export interface Bracket {
  address: string;
  balanceBase?: Decimal;
  balanceQuote?: Decimal;
  fundingBase?: Decimal;
  fundingQuote?: Decimal;
}

export interface PriceRange {
  lower: Decimal;
  upper: Decimal;
  token: TokenDetails;
}

export abstract class BaseStrategy {
  transactionHash: string;
  brackets: Bracket[];
  prices: Decimal[];
  startBlockNumber: number;
  baseTokenId: number;
  quoteTokenId: number;
  baseTokenDetails: TokenDetails;
  quoteTokenDetails: TokenDetails;
  tokenQuoteBalances: Record<string, BN>;
  tokenBaseBalances: Record<string, BN>;
  baseFunding: Decimal;
  quoteFunding: Decimal;
  owner: string;
  created: Date;
  priceRange: PriceRange;
}

export interface IStrategy {
  readFunding(context: ContractInteractionContextProps): Promise<void>;
  readStatus(context: ContractInteractionContextProps): Promise<void>;
  readBalances(context: ContractInteractionContextProps): Promise<void>;
}
