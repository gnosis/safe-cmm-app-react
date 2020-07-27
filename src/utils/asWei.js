import web3 from "web3";
import Decimal from "decimal.js"

const { toBN } = web3.utils;

const asWei = (ethValue) => {
  const asDecimal = new Decimal(ethValue);
  const asBN = toBN(asDecimal.mul(1e18).toString());
  return asBN;
};

export default asWei;
