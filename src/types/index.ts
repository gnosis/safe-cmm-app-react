export interface TokenDetails {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  imageUrl?: string;
  onGP?: boolean;
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
