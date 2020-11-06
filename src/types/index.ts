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
