import Decimal from "decimal.js";

import { Bracket, PriceRange } from "logic/IStrategy";

export interface TokenDetails {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  imageUrl?: string;
  onGP?: boolean;
  id?: number;
}

export interface SafeInfo {
  safeAddress: string;
  network: string;
  ethBalance: string;
}

export interface WithdrawState {
  status?: "loading" | "success" | "error";
  message?: string;
}

export type StrategyStatusEnum =
  | "UNKNOWN"
  | "INCOMPLETE"
  | "ACTIVE"
  | "PENDING"
  | "TRADING_STOPPED"
  | "CLOSED";

export type LoadingState = "LOADING" | "SUCCESS" | "ERROR";

export interface StrategyState {
  transactionHash: string;
  status: StrategyStatusEnum;
  created: Date;
  firstBatchId: number;
  priceRange: PriceRange;
  prices: Decimal[];
  withdrawRequestDate: Date;
  baseToken: TokenDetails;
  quoteToken: TokenDetails;
  baseFunding: Decimal;
  quoteFunding: Decimal;
  baseBalance: Decimal;
  quoteBalance: Decimal;
  brackets: Bracket[];
  nonce?: number;

  hasErrored: boolean;

  hasFetchedBalance: boolean;
  hasFetchedStatus: boolean;
  hasFetchedFunding: boolean;
}

export type Unpromise<T> = T extends Promise<infer U> ? U : T;
