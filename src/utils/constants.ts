import Decimal from "decimal.js";

export enum Network {
  mainnet = 1,
  ropsten = 3,
  rinkeby = 4,
  goerli = 5,
  kovan = 42,
}

export const INFURA_API_KEY = process.env.INFURA_API_KEY;

export const SAFE_ENDPOINT_URLS = {
  [Network.rinkeby]: `https://safe-transaction.rinkeby.gnosis.io`,
  [Network.mainnet]: `https://safe-transaction.gnosis.io`,
};

export const DEFAULT_INPUT_WIDTH = "130px";

export const ZERO_DECIMAL = new Decimal("0");
export const ONE_DECIMAL = new Decimal("1");

export const MINIMUM_BRACKETS = 1;
export const MAXIMUM_BRACKETS = 10;

export const PRICE_CACHE_TIME = 30; // in seconds
