import uuidAsInt from "./utils/uuidAsInt";

import getLogger from "utils/logger";
import makeFakeArtifacts from "utils/makeFakeArtifacts";

import { importCalculateFleetAddresses } from "api/utils/dexImports";

const logger = getLogger("deploy-fleet");

const deployFleet = async (context, { numBrackets, masterSafeAddress }) => {
  const {
    safeInfo: { safeAddress: from },
    getDeployed,
  } = context;

  await getDeployed("GnosisSafeProxyFactory");

  const { calcSafeAddresses } = importCalculateFleetAddresses(context);

  const fleetFactory = await getDeployed("FleetFactoryDeterministic");

  // Contract needs to be a truffle contract. Use makeFakeArtifacts to quickly get an instance
  const makeArtifacts = makeFakeArtifacts(context);
  const fleetFactoryDeterministicContract = makeArtifacts.require(
    "FleetFactoryDeterministic"
  );
  const deployedFleetFactory = await fleetFactoryDeterministicContract.deployed();

  const saltNonce = uuidAsInt();
  logger.log(`used salt nonce ${saltNonce}`);
  const predictedAddresses = await calcSafeAddresses(
    numBrackets,
    saltNonce,
    deployedFleetFactory,
    masterSafeAddress
  );

  const transactionData = fleetFactory.methods
    .deployFleetWithNonce(from, numBrackets, masterSafeAddress, saltNonce)
    .encodeABI();

  logger.log(
    `predicted addresses for ${numBrackets} brackets`,
    predictedAddresses
  );
  return {
    safeAddresses: predictedAddresses,
    tx: {
      from,
      to: fleetFactory.options.address,
      value: 0,
      data: transactionData,
    },
  };
};

export default deployFleet;
