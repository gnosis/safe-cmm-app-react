import Web3 from "web3";

import { NETWORK_URL } from "./constants";

const initWeb3 = () => {
  const web3 = new Web3(NETWORK_URL);

  return web3;
};

export default initWeb3;
