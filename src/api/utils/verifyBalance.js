import web3 from "web3";

const { toBN } = web3.utils;

const verifyBalance = async (tokenContract, ownerAddress, amount) => {
  const balance = await tokenContract.methods.balanceOf(ownerAddress).call();
  const amountBN = toBN(amount);
  // console.log(balance.toString());
  // console.log(amountBN.toString());
  return toBN(balance).gt(amountBN);
};

export default verifyBalance;
