import getLogger from "utils/logger";

const logger = getLogger("deploy-strategy");

import verifyBalance from "api/utils/verifyBalance";

export class ValidationError extends Error {}

const deployStrategy = async (
  { sdk, getContract, getDeployed, safeInfo: { safeAddress } },
  numBrackets,
  tokenAddressBase,
  tokenAddressQuote,
  boundsLowerWei,
  boundsUpperWei,
  investmentBaseWei,
  investmentQuoteWei
) => {
  console.log([
    safeAddress,
    numBrackets,
    tokenAddressBase,
    tokenAddressQuote,
    boundsLowerWei,
    boundsUpperWei,
    investmentBaseWei,
    investmentQuoteWei,
  ]);

  //const ERC20Contract = await getContract("ERC20Detailed");

  const tokenBaseContract = await getContract(
    "ERC20Detailed",
    tokenAddressBase
  );
  const tokenQuoteContract = await getContract(
    "ERC20Detailed",
    tokenAddressQuote
  );

  //console.log({ tokenBaseContract, tokenQuoteContract })

  logger.log(`==> Running sanity checks`);
  const hasEnoughBalanceBase = await verifyBalance(
    tokenBaseContract,
    safeAddress,
    investmentBaseWei
  );
  const hasEnoughBalanceQuote = await verifyBalance(
    tokenQuoteContract,
    safeAddress,
    investmentBaseWei
  );

  if (!hasEnoughBalanceBase)
    throw new ValidationError("Insufficient Balance of Base tokens"); // TODO: add name
  if (!hasEnoughBalanceQuote)
    throw new ValidationError("Insufficient Balance of Quote tokens"); // TODO: add name

  if (numBrackets > 23) {
    throw new ValidationError(
      "Too many brackets. Unfortunately the custom market maker currently only supports at max 23 due to the blockgas limit."
    );
  }

  logger.log(`==> Deploying safe fleet`);
  const safeFleetContract = await getDeployed("FleetFactory");
  const masterSafe = await getDeployed("GnosisSafe");
  const exchangePromise = await getDeployed("dex-contracts/BatchExchange");
  console.log(masterSafe);
  console.log(exchangePromise);

  console.log(safeFleetContract);
  const deploymentTx = safeFleetContract.methods
    .deployFleet(safeAddress, numBrackets, masterSafe.options.address)
    .encodeABI();
  const safeTx = await sdk.sendTransactions([
    {
      to: safeFleetContract.options.address,
      value: 0,
      data: deploymentTx,
    },
  ]);

  console.log(safeTx);

  logger.log(`==> Building orders`);
};

export default deployStrategy;
