import Web3 from "web3";
const NETWORK = process.env.NETWORK || "local";
const API_KEY = process.env.INFURA_API_KEY;

export const RINKEBY = "rinkeby";
export const MAINNET = "mainnet";

const NETWORK_INFURA_NODES = {
  [RINKEBY]: `https://rinkeby.infura.io/v3/${API_KEY}`,
  [MAINNET]: `https://mainnet.infura.io/v3/${API_KEY}`,
};

if (!API_KEY)
  throw new Error(
    "Missing Infura key - please define the env variable `INFURA_API_KEY`"
  );
if (!(NETWORK in NETWORK_INFURA_NODES))
  throw new Error(
    `Invalid or missing Network defined, no valid Infura API URL avaialble for ${NETWORK}`
  );

const initWeb3 = () => {
  const networkUrl = NETWORK_INFURA_NODES[NETWORK];

  const web3 = new Web3(networkUrl);

  return web3;
};

export default initWeb3;
