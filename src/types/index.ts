import Decimal from "decimal.js";

import { Bracket, PriceRange } from "logic/IStrategy";

import { Trade } from "api/web3/trades";

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
  deploymentBlock: number;
  firstBatchId: number;
  priceRange: PriceRange;
  prices: Decimal[];
  withdrawRequestDate: Date;
  claimDate: Date;
  baseToken: TokenDetails;
  quoteToken: TokenDetails;
  baseFunding: Decimal;
  quoteFunding: Decimal;
  baseBalance: Decimal;
  quoteBalance: Decimal;
  baseWithdrawn: Decimal;
  quoteWithdrawn: Decimal;
  brackets: Bracket[];
  nonce?: number;

  hasErrored: boolean;

  hasFetchedBalance: boolean;
  hasFetchedStatus: boolean;
  hasFetchedFunding: boolean;
}

export interface TradesState {
  trades: Trade[];
  lastCheckedBlock: number;
}

export type Unpromise<T> = T extends Promise<infer U> ? U : T;
