import getLogger from "utils/logger";

const logger = getLogger("deploy-strategy");

import verifyBalance from "api/utils/verifyBalance";
import deployFleet from "api/eth/deployFleet";
import orderAndFund from "api/eth/orderAndFund";

export class ValidationError extends Error {}

const deployStrategy = async (
  context,
  numBrackets,
  tokenAddressBase,
  tokenAddressQuote,
  boundsLower,
  boundsUpper,
  investmentBaseWei,
  investmentQuoteWei,
  currentPrice
) => {
  logger.log(
    `==> Arguments for Deployment`,
    ...[
      numBrackets,
      tokenAddressBase,
      tokenAddressQuote,
      boundsLower,
      boundsUpper,
      investmentBaseWei,
      investmentQuoteWei,
    ].map((n) => n.toString())
  );

  const {
    sdkInstance,
    getContract,
    getDeployed,
    getArtifact,
    getErc20Details,
    safeInfo: { safeAddress },
  } = context;

  //const ERC20Contract = await getContract("ERC20Detailed");
  logger.log(`==> Fetching all contracts`);
  const [
    tokenBaseContract,
    tokenQuoteContract,
    masterSafeContract,
  ] = await Promise.all([
    getContract("ERC20Detailed", tokenAddressBase),
    getContract("ERC20Detailed", tokenAddressQuote),
    getDeployed("GnosisSafe"),
    getArtifact("Migrations"),
  ]);
  const masterSafeAddress = masterSafeContract.options.address;

  logger.log(`==> Master Safe is ${masterSafeAddress}`);
  logger.log(`==> Running sanity checks`);
  const hasEnoughBalanceBase = await verifyBalance(
    tokenBaseContract,
    safeAddress,
    investmentBaseWei
  );
  const hasEnoughBalanceQuote = await verifyBalance(
    tokenQuoteContract,
    safeAddress,
    investmentQuoteWei
  );

  const tokenBaseDetails = await getErc20Details(
    tokenBaseContract.options.address
  );
  const tokenQuoteDetails = await getErc20Details(
    tokenQuoteContract.options.address
  );

  if (!hasEnoughBalanceBase)
    throw new ValidationError(
      `Insufficient Balance of Base ${tokenBaseDetails.symbol} tokens`
    ); // TODO: add name
  if (!hasEnoughBalanceQuote)
    throw new ValidationError(
      `Insufficient Balance of Quote ${tokenQuoteDetails.symbol} tokens`
    ); // TODO: add name

  if (numBrackets > 23) {
    throw new ValidationError(
      "Too many brackets. Unfortunately the custom market maker currently only supports at max 23 due to the blockgas limit."
    );
  }

  const { tx: deployFleetTx, safeAddresses } = await deployFleet(context, {
    numBrackets,
    masterSafeAddress,
  });

  const { txs: orderAndFundTxs } = await orderAndFund(context, {
    safeAddresses,
    masterSafeAddress,
    tokenBaseContract,
    tokenQuoteContract,
    currentPrice,
    boundsLower,
    boundsUpper,
    investmentBaseWei,
    investmentQuoteWei,
  });

  sdkInstance.sendTransactions([deployFleetTx, ...orderAndFundTxs]);
};

export default deployStrategy;
