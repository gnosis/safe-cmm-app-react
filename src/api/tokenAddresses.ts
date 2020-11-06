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
    "0x0000000000085d4780B73119b644AE5ecd22b376", // tusd
  ],
  [Network.rinkeby]: [
    "0xc778417E063141139Fce010982780140Aa0cD5Ab", // weth
    "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b", // usdc
    "0x0000000000085d4780B73119b644AE5ecd22b376", // tusd
    "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa", // dai
    "0xd0Dab4E640D95E9E8A47545598c33e31bDb53C7c", // gno
    "0xa7D1C04fAF998F9161fC9F800a99A809b84cfc9D", // owl
    "0x784B46A4331f5c7C495F296AE700652265ab2fC6", // gusd
    "0xBD6A9921504fae42EaD2024F43305A8ED3890F6f", // pax
    "0xa9881E6459CA05d7D7C95374463928369cD7a90C", // usdt
    "0xa3a0b8ce8aed4d90362782758767e3a0bb9ffdd5", // uni --- not registered, here to test only
  ],
  [Network.xdai]: [
    "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb", // GNO
    "0x0905Ab807F8FD040255F0cF8fa14756c1D824931", // OWL
    "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d", // wxDai
    "0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e", // STAKE
    "0xB1950Fb2C9C0CbC8553578c67dB52Aa110A93393", // sUSD
  ],
};

// TODO: no need to be async now, but when we load it from a TCR it'll be
export async function getTokenAddressesForNetwork(
  network: Network
): Promise<string[]> {
  return tokenAddresses[network] || [];
}
