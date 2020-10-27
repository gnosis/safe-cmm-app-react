import { Network, INFURA_API_KEY, SAFE_ENDPOINT_URLS } from "utils/constants";

const checkNetwork = (networkName: string): void => {
  if (Network[networkName] == null) {
    throw new Error(
      `Network not configured. Please use a different network or configure the network id for ${networkName}`
    );
  }

  if (SAFE_ENDPOINT_URLS[Network[networkName]] == null) {
    throw new Error(
      `Safe Endpoint for ${networkName} is not configured. Please use a different network or configure the safe endpoint for ${networkName}`
    );
  }
};

export const getSafeEndpoint = (networkName: string): string => {
  checkNetwork(networkName);
  return SAFE_ENDPOINT_URLS[Network[networkName]];
};

export function getRpcEndpoint(networkName: string): string {
  checkNetwork(networkName);

  // xDai not available on Infura, going with the default xDai endpoint instead
  if (networkName === "xdai") {
    return "wss://rpc.xdaichain.com/wss";
  }
  return `wss://${networkName}.infura.io/ws/v3/${INFURA_API_KEY}`;
}
