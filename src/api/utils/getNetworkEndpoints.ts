import {
  Network,
  SAFE_ENDPOINT_URLS,
  INFURA_ENDPOINT_URL,
} from "utils/constants";

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

  if (INFURA_ENDPOINT_URL[Network[networkName]] == null) {
    throw new Error(
      `Infura Endpoint for ${networkName} is not configured. Please use a different network or configure the infura endpoint for ${networkName}`
    );
  }
};

export const getSafeEndpoint = (networkName: string): string => {
  checkNetwork(networkName);
  return SAFE_ENDPOINT_URLS[Network[networkName]];
};

export const getInfuraEndpoint = (networkName: string): string => {
  checkNetwork(networkName);
  return INFURA_ENDPOINT_URL[Network[networkName]];
};
