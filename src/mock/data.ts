import { TokenDetails } from "types";

export const mockTokenDetails: { [address: string]: TokenDetails } = {
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "WETH",
    name: "Wrapped ETH",
    decimals: 18,
    imageUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  }, // weth
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    name: "",
    decimals: 18,
    imageUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  }, // usdc
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    name: "",
    decimals: 18,
    imageUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
  }, // dai
  "0x6810e776880C02933D47DB1b9fc05908e5386b96": {
    address: "0x6810e776880C02933D47DB1b9fc05908e5386b96",
    symbol: "GNO",
    name: "",
    decimals: 18,
    imageUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6810e776880C02933D47DB1b9fc05908e5386b96/logo.png",
  }, // gno
  "0x1A5F9352Af8aF974bFC03399e3767DF6370d82e4": {
    address: "0x1A5F9352Af8aF974bFC03399e3767DF6370d82e4",
    symbol: "OWL",
    name: "",
    decimals: 18,
    imageUrl:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x1A5F9352Af8aF974bFC03399e3767DF6370d82e4/logo.png",
  }, // owl
  "0x1A5F9352Af8aF974bFC03399e3767DF6370d8200": {
    address: "0x1A5F9352Af8aF974bFC03399e3767DF6370d8200",
    symbol: "FAKE",
    name: "Fake token without an image",
    decimals: 5,
  },
  "0x000F9352Af8aF974bFC03399e3767DF6370d8200": {
    address: "0x000F9352Af8aF974bFC03399e3767DF6370d8200",
    symbol: "FAKE2",
    name: "Fake token with non existent image",
    decimals: 22,
    imageUrl: "https://this.link.should.go.nowhere",
  },
};
