const NETWORK = process.env.NETWORK || "local";

const RINKEBY = "rinkeby";
const MAINNET = "mainnet";

const NETWORK_API_URLS = {
  [RINKEBY]: `https://safe-transaction.rinkeby.gnosis.io/`,
  [MAINNET]: `https://safe-transaction.gnosis.io/`,
};

export const API_URL = NETWORK_API_URLS[NETWORK];

if (!API_URL) {
  throw new Error(
    `Network ${NETWORK} has no API_URL configured. - Please define a different network using the env variable NETWORK or add the API_URL to src/api/tx/index.js`
  );
}

export const getTransactions = async (safeAddress) => {
  const response = await fetch(
    `${API_URL}/api/v1/safes/${safeAddress}/transactions`
  );
  const txs = await response.json();
  console.log(txs)

  return txs.results;
};
