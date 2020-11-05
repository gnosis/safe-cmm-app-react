import { DecoderData } from "./utils/flattenMultiSend";

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
  to: string;
  value: string;
  data: string;
  operation: number;
  gasToken: string;
  safeTxGas: number;
  baseGas: number;
  gasPrice: string;
  refundReceiver: string;
  nonce: number;
  submissionDate: string;
  executionDate: string;
  modified: string;
  blockNumber?: number;
  transactionHash?: string;
  safeTxHash: string;
  executor?: string;
  isExecuted: boolean;
  isSuccessful?: boolean;
  ethGasPrice?: string;
  gasUsed?: string;
  fee?: string;
  origin: string;
  confirmationsRequired?: any;
  confirmations?: Record<string, any>[];
  signatures?: any;
}
