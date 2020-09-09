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
  boundsLowerWei,
  boundsUpperWei,
  investmentBaseWei,
  investmentQuoteWei,
  currentPriceWei
) => {
  logger.log(
    `==> Arguments for Deployment`,
    ...[
      numBrackets,
      tokenAddressBase,
      tokenAddressQuote,
      boundsLowerWei,
      boundsUpperWei,
      investmentBaseWei,
      investmentQuoteWei,
    ].map((n) => n.toString())
  );

  const {
    sdk,
    getContract,
    getDeployed,
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
    investmentBaseWei
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
    currentPriceWei,
    boundsLowerWei,
    boundsUpperWei,
    investmentBaseWei,
    investmentQuoteWei,
  });

  sdk.sendTransactions([deployFleetTx, ...orderAndFundTxs]);
};

export default deployStrategy;
