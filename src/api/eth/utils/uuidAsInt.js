import { v4 as uuid } from "uuid";
import web3 from "web3";

const { toBN, BN } = web3.utils;

const uuidAsInt = () => {
  const uuidBuffer = new Uint8ClampedArray(16);
  uuid(null, uuidBuffer);

  let uuidInt = new BN();
  for (let i = uuidBuffer.length-1; i > 0; i--) {
    //console.log(`${uuidBuffer[i]} << ${i * 8}`);
    //console.log(
    //  toBN(uuidBuffer[i])
    //    .shln(i * 8)
    //    .toString()
    //);
    uuidInt.iadd(toBN(uuidBuffer[i]).shln(i * 8));
  }

  return uuidInt.toString();
};

export default uuidAsInt;
