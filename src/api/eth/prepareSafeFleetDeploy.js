const prepareSafeFleetDeploy = async (
  { instance: web3Instance, sdk, safeInfo: { safeAddress: from }, getDeployed },
  { numBrackets }
) => {
  const fleetFactory = await getDeployed("FleetFactory");
  const masterSafe = await getDeployed("GnosisSafe");

  const transactionData = fleetFactory.methods
    .deployFleetWithNonce(from, numBrackets, masterSafe.options.address, 1337)
    .encodeABI();

  return {
    tx: {
      from,
      to: fleetFactory.options.address,
      value: 0,
      data: transactionData,
    },
  };
};

export default prepareSafeFleetDeploy;
