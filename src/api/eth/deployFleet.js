import uuidAsInt from "./utils/uuidAsInt";

import getLogger from "utils/logger";

import calcFleetAddressesInitializer from "@gnosis.pm/dex-liquidity-provision/scripts/utils/calculate_fleet_addresses";
import makeFakeArtifacts from "utils/makeFakeArtifacts";

let instance;
const runFleetAddressCalcInitializerIfNotRan = (context) => {
  if (!instance) {
    instance = calcFleetAddressesInitializer(
      context.instance,
      makeFakeArtifacts(context)
    );
  }

  return instance;
};

const logger = getLogger("deploy-fleet");

const deployFleet = async (context, { numBrackets, masterSafeAddress }) => {
  const {
    safeInfo: { safeAddress: from },
    getDeployed,
  } = context;

  await getDeployed("GnosisSafeProxyFactory");

  const { calcSafeAddresses } = runFleetAddressCalcInitializerIfNotRan(context);

  const fleetFactory = await getDeployed("FleetFactoryDeterministic");

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
