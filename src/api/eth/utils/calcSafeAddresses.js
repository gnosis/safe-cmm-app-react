import web3 from "web3";

import { generateAddress2, toBuffer, bufferToHex } from "ethereumjs-util";
const { toBN, sha3 } = web3.utils;

window.web3Instance = web3;
const stringNumEncode = (strNum) => {
  const bnNum = toBN(strNum);
  const bnHex = bnNum.toString(16);

  return `0x${"0".repeat(64 - bnHex.length)}${bnHex}`;
};

const calculateSafeAddress = (
  deployedByteCode,
  fleetFactoryAddress,
  masterSafeAddress,
  proxyFactory,
  saltNonce,
  bracketIndex
) => {
  const saltForBracket = toBN(sha3(saltNonce)).iadd(toBN(bracketIndex));
  console.log(saltForBracket.toString())
  const abiCall = proxyFactory.methods
    .createProxyWithNonce(masterSafeAddress, 0x0, saltForBracket)
    .encodeABI();
  console.log(abiCall)

  const byteCode = `0x${deployedByteCode.slice(2)}${abiCall.slice(2)}`;

  const fromBuffer = toBuffer(fleetFactoryAddress);
  const saltBuffer = toBuffer(stringNumEncode(saltForBracket));
  const bytecodeBuffer = toBuffer(byteCode);

  console.log(fromBuffer.length, saltBuffer.length, bytecodeBuffer.length);

  const safeAddress = generateAddress2(fromBuffer, saltBuffer, bytecodeBuffer);

  console.log(bufferToHex(safeAddress));
  return safeAddress;
};

const calcSafeAddresses = async (
  { getContract },
  fleetFactory,
  from,
  bracketCount,
  masterSafeAddress,
  saltNonce
) => {
  // Retrieve the proxy factory address that will be used to create new Safes
  console.log(fleetFactory);
  const proxyFactoryAddress = await fleetFactory.methods.proxyFactory
    .call()
    .call();

  const proxyFactory = await getContract(
    "GnosisSafeProxyFactory",
    proxyFactoryAddress
  );

  const deployedBytecode = await proxyFactory.methods.proxyCreationCode
    .call()
    .call();

  const safeAddress = calculateSafeAddress(
    deployedBytecode,
    fleetFactory.options.address,
    masterSafeAddress,
    proxyFactory,
    saltNonce,
    0
  );
  console.log(safeAddress)
  return safeAddress
};

export default calcSafeAddresses;
