import { SAFE_ENDPOINT_URL, NETWORK } from "../../utils/constants";

if (!SAFE_ENDPOINT_URL) {
  throw new Error(
    `Network ${NETWORK} has no API_URL configured. - Please define a different network using the env variable NETWORK or add the API_URL to src/api/tx/index.js`
  );
}

export const getTransactions = async (safeAddress) : Promise<any[]> => {
  const response = await fetch(
    `${SAFE_ENDPOINT_URL}/api/v1/safes/${safeAddress}/transactions`
  );
  const txs = await response.json();
  //console.log(txs);

  return txs.results;
};

export const getPendingTransactions = async (safeAddress) : Promise<any[]> => {
  const response = await fetch(
    `${SAFE_ENDPOINT_URL}/api/v1/safes/${safeAddress}/transactions?executed=false`
  );
  const txs = await response.json();
  //console.log(txs);

  return txs.results;
};
