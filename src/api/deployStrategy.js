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
  investmentQuoteWei
) => {
  console.log([
    numBrackets,
    tokenAddressBase,
    tokenAddressQuote,
    boundsLowerWei,
    boundsUpperWei,
    investmentBaseWei,
    investmentQuoteWei,
  ]);

  const {
    sdk,
    getContract,
    getDeployed,
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
  console.log(masterSafeContract)
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

  const { tx: deployFleetTx, safeAddresses } = await deployFleet(context, {
    numBrackets,
    masterSafeAddress,
  });

  const { txs: orderAndFundTxs } = await orderAndFund(context, {
    safeAddresses,
    masterSafeAddress,
    tokenBaseContract,
    tokenQuoteContract,
    boundsLowerWei,
    boundsUpperWei,
    investmentBaseWei,
    investmentQuoteWei,
  });

  sdk.sendTransactions([deployFleetTx, ...orderAndFundTxs]);
};

export default deployStrategy;
