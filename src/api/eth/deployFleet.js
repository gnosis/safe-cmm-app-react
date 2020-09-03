import calcSafeAddresses from "./utils/calcSafeAddresses";
import uuidAsInt from "./utils/uuidAsInt";

const deployFleet = async (context, { numBrackets, masterSafeAddress }) => {
  const {
    safeInfo: { safeAddress: from },
    getDeployed,
  } = context;

  const fleetFactory = await getDeployed("FleetFactoryDeterministic");

  const saltNonce = uuidAsInt();

  const predictedAddresses = await calcSafeAddresses(
    context,
    fleetFactory,
    numBrackets,
    masterSafeAddress,
    saltNonce
  );

  const transactionData = fleetFactory.methods
    .deployFleetWithNonce(from, numBrackets, masterSafeAddress, saltNonce)
    .encodeABI();

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
