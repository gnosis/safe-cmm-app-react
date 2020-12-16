import { importTradingStrategyHelpers } from "api/utils/dexImports";
import Decimal from "decimal.js";

import getLogger from "utils/logger";

const logger = getLogger("orderAndFund");

const orderAndFund = async (
  context,
  {
    safeAddresses,
    currentPriceWei: currentPrice,
    tokenBaseContract,
    tokenBaseDetails,
    tokenQuoteContract,
    tokenQuoteDetails,
    boundsLowerWei: boundsLower,
    boundsUpperWei: boundsUpper,
    investmentBaseWei,
    investmentQuoteWei,
  }
) => {
  // We need to load these contracts before entering buildTransferApproveDepositFromOrders
  // because it uses artifacts.require - even though it's a shim, it still expects to receive
  // contract artifacts without delay (no promises), so we need to preload them here.
  await Promise.all([
    context.getArtifact("IProxy"),
    context.getArtifact("GnosisSafe"),
    context.getArtifact("MultiSend"),
    context.getArtifact("BatchExchange"),
    context.getArtifact("FleetFactory"),
    context.getArtifact("FleetFactoryDeterministic"),
  ]);

  const {
    transactionsForTransferApproveDepositFromOrders,
    transactionsForOrders,
  } = importTradingStrategyHelpers(context);

  const batchExchangeContract = await context.getDeployed("BatchExchange");
  const [tokenBaseId, tokenQuoteId] = await Promise.all([
    batchExchangeContract.methods
      .tokenAddressToIdMap(tokenBaseContract.options.address)
      .call(),
    batchExchangeContract.methods
      .tokenAddressToIdMap(tokenQuoteContract.options.address)
      .call(),
  ]);
  logger.log(
    `==> Base token address: ${tokenBaseContract.options.address}; token id: ${tokenBaseId}`
  );
  logger.log(
    `==> Quote token address: ${tokenQuoteContract.options.address}; token id: ${tokenQuoteId}`
  );

  const orderTransactions = await transactionsForOrders(
    context.safeInfo.safeAddress,
    safeAddresses,
    tokenBaseId,
    tokenQuoteId,
    boundsLower,
    boundsUpper,
    true
  );

  const fundTransactions = await transactionsForTransferApproveDepositFromOrders(
    context.safeInfo.safeAddress,
    safeAddresses,
    tokenBaseContract.options.address,
    tokenQuoteContract.options.address,
    boundsLower,
    boundsUpper,
    currentPrice,
    investmentQuoteWei,
    investmentBaseWei,
    false
  );

  return {
    txs: [...orderTransactions, ...fundTransactions],
  };
};

export default orderAndFund;
