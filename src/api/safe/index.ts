import { getSafeEndpoint } from "api/utils/getNetworkEndpoints";

export const getTransactions = async (
  network: string,
  safeAddress: string
): Promise<any[]> => {
  const safeEndpoint = getSafeEndpoint(network);
  const response = await fetch(
    `${safeEndpoint}/api/v1/safes/${safeAddress}/transactions`
  );
  const txs = await response.json();
  //console.log(txs);

  return txs.results;
};

export const getBalances = async (
  network: string,
  safeAddress: string
): Promise<any> => {
  const safeEndpoint = getSafeEndpoint(network);
  const response = await fetch(
    `${safeEndpoint}/api/v1/safes/${safeAddress}/balances`
  );
  return response.json();
};

export const getPendingTransactions = async (
  network: string,
  safeAddress: string
): Promise<any[]> => {
  const safeEndpoint = getSafeEndpoint(network);
  const requestSafe = await fetch(
    `${safeEndpoint}/api/v1/safes/${safeAddress}/`
  );
  const responseSafe = await requestSafe.json();

  const requestTxs = await fetch(
    `${safeEndpoint}/api/v1/safes/${safeAddress}/transactions?executed=false&nonce__gte=${responseSafe.nonce}`
  );
  const responseTxs = await requestTxs.json();

  const txs = responseTxs.results.filter((tx) => tx.isSuccessful === null);

  return txs;
};
