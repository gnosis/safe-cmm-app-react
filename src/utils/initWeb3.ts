import Web3 from "web3";
import { getInfuraEndpoint } from "api/utils/getNetworkEndpoints";

const initWeb3 = (network: string): any => {
  const infuraEndpoint = getInfuraEndpoint(network);
  const web3 = new Web3(infuraEndpoint);

  return web3;
};

export default initWeb3;
