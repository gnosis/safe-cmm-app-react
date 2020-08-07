import deploySafeFleet from "./transactions/deploySafeFleet";
import findAndMatch from "./findAndMatch";
import orderAndFund from "./transactions/orderAndFund";

/**
 * Executes the complete deploy, order and fund flow.
 *
 * @param {string} from - Account address
 * @param {object} transactionDataOrNull - Transaction data, per step
 */
const deployAndProvision = async (
  { sdk, instance: web3, safeInfo: { safeAddress: from }, getDeployed },
  {
    numBrackets,
    tokenBaseContract,
    tokenQuoteContract,
    boundsLowerWei,
    boundsUpperWei,
    investmentBaseWei,
    investmentQuoteWei,
  }
) => {
  // Check if deploy fleet tx has been executed
  let lastTransactionForFleetDeposit = await findAndMatch("deployFleet", from);

  if (!lastTransactionForFleetDeposit) {
    const safeFleetContract = await getDeployed("FleetFactory");
    const masterSafe = await getDeployed("GnosisSafe");

    const txData = safeFleetContract.methods
      .deployFleet(from, numBrackets, masterSafe.options.address)
      .encodeABI();

    await deploySafeFleet(sdk, from, safeFleetContract.options.address, txData);
    return;
  }

  if (!lastTransactionForFleetDeposit.isExecuted) {
    alert(
      `Transaction not confirmed. Please go to the transactions screen and confirm transaction ${lastTransactionForFleetDeposit.safeTxHash}`
    );
  }

  const fleetFactoryDeployed = await getDeployed("FleetFactory");
  const events = await fleetFactoryDeployed.getPastEvents("FleetDeployed", {
    filter: { owner: from },
    fromBlock: 0,
    toBlock: "latest",
  });

  if (!events) {
    alert(
      `Transaction is not yet mined. Please wait until the transaction ${lastTransactionForFleetDeposit.transactionHash} is completed.`
    );
  }

  const [
    {
      returnValues: { fleet: bracketAddresses },
    },
  ] = events;

  console.log(bracketAddresses);

  console.log(lastTransactionForFleetDeposit);

  // Check if order tx has been executed
  let lastTransactionForBuildOrder; // = findTxForMethod('')

  if (!lastTransactionForBuildOrder) {
    const masterSafe = await getDeployed("GnosisSafe");
    const mutliSend = await getDeployed("MultiSend");
    const exchange = await getDeployed("dex-contracts/BatchExchange");

    await orderAndFund(
      { sdk, web3 },
      mutliSend,
      from,
      masterSafe,
      exchange,
      bracketAddresses,
      tokenBaseContract,
      tokenQuoteContract,
      boundsLowerWei,
      boundsUpperWei,
      investmentBaseWei,
      investmentQuoteWei
    );
    return;
  }

  // Check if fund tx has been executed
};

export default deployAndProvision;
