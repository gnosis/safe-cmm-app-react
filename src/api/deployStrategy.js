import getLogger from "utils/logger";

const logger = getLogger("deploy-strategy");

import verifyBalance from "api/utils/verifyBalance";
import deployFleet from "api/eth/deployFleet";

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

  const { sdk, instance, getContract, getDeployed, safeInfo: { safeAddress } } = context;

  //const ERC20Contract = await getContract("ERC20Detailed");
  console.log(safeAddress)
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

  const deployFleetData = await deployFleet(context, {
    numBrackets,
    tokenBaseContract,
    tokenQuoteContract,
    boundsLowerWei,
    boundsUpperWei,
    investmentBaseWei,
    investmentQuoteWei,
  });

  sdk.sendTransactions([
    deployFleetData.tx
  ])
};

export default deployStrategy;
