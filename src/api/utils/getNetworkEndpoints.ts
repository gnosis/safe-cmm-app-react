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

export const getInfuraEndpoint = (networkName: string): string => {
  checkNetwork(networkName);
  return `https://${networkName}.infura.io/v3/${INFURA_API_KEY}`;
};
