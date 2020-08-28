// TODO: refactor and get these from the same file instead of repeating it everywhere

import { Network } from "utils/constants";

// TODO: dynamically load from a TCR
const tokenAddresses: { [networkId: number]: string[] } = {
  [Network.mainnet]: [
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // weth
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // usdc
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // dai
    "0x6810e776880C02933D47DB1b9fc05908e5386b96", // gno
    "0x1A5F9352Af8aF974bFC03399e3767DF6370d82e4", // owl
  ],
  [Network.rinkeby]: [
    "0xc778417E063141139Fce010982780140Aa0cD5Ab", // weth
    "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b", // usdc
    "0x0000000000085d4780B73119b644AE5ecd22b376", // tusd
    "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa", // dai
    "0xd0Dab4E640D95E9E8A47545598c33e31bDb53C7c", // gno
    "0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D", // owl
  ],
};

// TODO: no need to be async now, but when we load it from a TCR it'll be
export async function getTokenAddressesForNetwork(
  network: Network
): Promise<string[]> {
  return tokenAddresses[network] || [];
}
