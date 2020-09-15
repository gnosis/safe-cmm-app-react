import web3 from "web3";
import Decimal from "decimal.js";

const { toBN } = web3.utils;

const asWei = (ethValue, decimals = 18) => {
  const powerOf = toBN("10").pow(toBN(decimals));
  const asDecimal = new Decimal(ethValue);
  const asBN = toBN(asDecimal.mul(powerOf.toString()).toNearest().toString());
  return asBN;
};

export default asWei;
