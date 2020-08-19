import web3 from "web3";
import calcSafeAddresses from "./utils/calcSafeAddresses";
import uuidAsInt from "./utils/uuidAsInt";

const deployFleet = async (context, { numBrackets }) => {
  const {
    instance: web3Instance,
    sdk,
    safeInfo: { safeAddress: from },
    getDeployed,
    getContract,
    getArtifact,
  } = context;

  const fleetFactory = await getDeployed("FleetFactory");
  const masterSafe = await getDeployed("GnosisSafe");

  //const uuidSalt = uuid(null, new Uint8ClampedArray(32));
  //console.log(uuidSalt);
  const saltNonce = Math.round(Math.random() * 100000).toString(); //uuidAsInt();

  const predictedAddresses = await calcSafeAddresses(
    context,
    fleetFactory,
    from,
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

  console.log(
    `deployFleetWithNonce("${from}", ${numBrackets}, "${masterSafe.options.address}", "${saltNonce}")`
  );

  return {
    tx: {
      from,
      to: fleetFactory.options.address,
      value: 0,
      data: transactionData,
    },
  };
};

export default deployFleet;
