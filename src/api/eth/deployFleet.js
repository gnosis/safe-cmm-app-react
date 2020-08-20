import calcSafeAddresses from "./utils/calcSafeAddresses";
import uuidAsInt from "./utils/uuidAsInt";

const deployFleet = async (context, { numBrackets }) => {
  const {
    safeInfo: { safeAddress: from },
    getDeployed,
  } = context;

  const fleetFactory = await getDeployed("FleetFactoryDeterministic");
  const masterSafe = await getDeployed("GnosisSafe");

  const saltNonce = uuidAsInt();

  const predictedAddresses = await calcSafeAddresses(
    context,
    fleetFactory,
    numBrackets,
    masterSafe.options.address,
    saltNonce
  );

  const transactionData = fleetFactory.methods
    .deployFleetWithNonce(
      from,
      numBrackets,
      masterSafe.options.address,
      saltNonce
    )
    .encodeABI();

  /*
  console.log(
    `deployFleetWithNonce("${from}", ${numBrackets}, "${masterSafe.options.address}", "${saltNonce}")`
  );
  */

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
