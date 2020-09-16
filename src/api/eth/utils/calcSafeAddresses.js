import web3 from "web3";

import getLogger from "utils/logger";

import { generateAddress2, toBuffer, bufferToHex } from "ethereumjs-util";
const { toBN, sha3 } = web3.utils;

const logger = getLogger("create2-address-calc");

window.web3Instance = web3;
const uint256Encode = (strNum) => {
  const bnNum = toBN(strNum);
  const bnHex = bnNum.toString(16);

  return `0x${"0".repeat(64 - bnHex.length)}${bnHex}`;
};

const generateSafeAddress = (
  deployedByteCode,
  masterSafeAddress,
  proxyFactory,
  saltNonce,
  safeIndex
) => {
  // Encode salt and safe index as padded uint256, the hashed result will be one part of the salt
  // used in the final address calculation
  const hexSaltNonceEncoded = uint256Encode(saltNonce).slice(2);
  const hexSafeIndexEncoded = uint256Encode(safeIndex).slice(2);
  const saltForBracket = toBN(
    sha3(`0x${hexSaltNonceEncoded}${hexSafeIndexEncoded}`)
  );

  // Replicate salting like it was done in ProxyFactory:
  // `bytes32 salt = keccak256(abi.encodePacked(keccak256(initializer), saltNonce));`
  const hexInitEncoded =
    "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"; // == sha3Raw("").slice(2) initializer we use is empty-string, only sha3Raw can handle it
  const hexSaltEncoded = uint256Encode(saltForBracket);
  const salt = sha3(`0x${hexInitEncoded}${hexSaltEncoded}`);

  // bytecode is "creation code" + left padded uint256 encoded address for the master safe template
  const hexCreationCode = deployedByteCode.slice(2);
  const hexSafeAddrEncoded = uint256Encode(masterSafeAddress).slice(2);
  const byteCode = `0x${hexCreationCode}${hexSafeAddrEncoded}`;

  // calculate the address that will be used for this index
  const safeAddress = generateAddress2(
    toBuffer(proxyFactory.options.address),
    toBuffer(uint256Encode(salt)),
    toBuffer(byteCode)
  );
  return bufferToHex(safeAddress);
};

const calcSafeAddresses = async (
  { getContract },
  fleetFactory,
  bracketCount,
  masterSafeAddress,
  saltNonce
) => {
  // Retrieve the proxy factory address that will be used to create new Safes
  const proxyFactoryAddress = await fleetFactory.methods.proxyFactory
    .call()
    .call();

  const proxyFactory = await getContract(
    "GnosisSafeProxyFactory",
    proxyFactoryAddress
  );

  // Retrieve the "creation code" of the proxy factory - needed in order to calculate the create2 addresses
  const deployedBytecode = await proxyFactory.methods.proxyCreationCode
    .call()
    .call();

  const safeAddresses = [];
  for (let bracketIndex = 0; bracketIndex < bracketCount; bracketIndex++) {
    const safeAddress = generateSafeAddress(
      deployedBytecode,
      masterSafeAddress,
      proxyFactory,
      saltNonce,
      bracketIndex
    );
    safeAddresses.push(safeAddress);
  }

  logger.log(`==> Precalculated the following Bracket Addresses`);
  logger.log(safeAddresses);

  return safeAddresses;
};

export default calcSafeAddresses;
