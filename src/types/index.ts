import BN from "bn.js";

export interface TokenDetails {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  imageUrl?: string;
}

export interface TokenBalance extends TokenDetails {
  balance: BN;
}

export interface SafeInfo {
  safeAddress: string;
  ethBalance: string;
}

export interface Web3Context {
  instance: any; // Web3
  safeInfo: SafeInfo;
  sdk: any; // SafeSDK
  getContract: (contractName: string, contractAddress: string) => Promise<any>;
  getDeployed: (contractName: string) => Promise<any>;
  getArtifact: (contractName: string) => Promise<any>;
  getCachedArtifact: (contractName: string) => any; // TruffleContract
  getErc20Details: (tokenName: string) => Promise<TokenBalance>;
}
