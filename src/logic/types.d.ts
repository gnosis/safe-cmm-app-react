import { DecoderData } from "./utils/calculateFunds";

export type StatusEnum = "PENDING" | "ACTIVE" | "CLOSED" | "UNKNOWN";

export interface Bracket {
  address: string;
  events?: any[];
  deposits?: DepositEvent[];
  withdrawRequests?: WithdrawEvent[];
  withdraws?: any[];
}

export interface DepositEvent {
  amount: string; // BN string
  token: string;
  batchId: number;
}

export interface WithdrawEvent {
  amount: string;
  batchId: number;
  created: Date;
}

export interface FleetDeployEvent {
  returnValues: {
    fleet: string[];
    owner: string;
  };
  transactionHash: string;
  blockNumber: number;
}

export interface PendingStrategySafeTransaction {
  safeTxHash: string;
  dataDecoded: DecoderData;
  nonce: number;
  submissionDate: string;
}
