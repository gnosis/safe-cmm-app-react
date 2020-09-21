import web3 from "web3";

import getLogger from "utils/logger";

const logger = getLogger("balance-check");
const { toBN } = web3.utils;

const verifyBalance = async (tokenContract, ownerAddress, amount) => {
  const balance = await tokenContract.methods.balanceOf(ownerAddress).call();
  const amountBN = toBN(amount);
  logger.log(
    `balance: ${balance.toString()} -> required: ${amountBN.toString()}`
  );
  return toBN(balance).gte(amountBN);
};

export default verifyBalance;
