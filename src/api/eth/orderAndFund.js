import runInitializerIfNotRan from "api/utils/tradingHelperInit";
import Decimal from "decimal.js";

const orderAndFund = async (
  context,
  {
    safeAddresses,
    currentPriceWei,
    tokenBaseContract,
    tokenBaseDetails,
    tokenQuoteContract,
    // tokenQuoteDetails,
    boundsLowerWei,
    boundsUpperWei,
    investmentBaseWei,
    investmentQuoteWei,
  }
) => {
  // We need to load these contracts before entering buildTransferApproveDepositFromOrders
  // because it uses artifacts.require - even though it's a shim, it still expects to receive
  // contract artifacts without delay (no promises), so we need to preload them here.
  await Promise.all([
    context.getArtifact("IProxy.sol"),
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
  } = runInitializerIfNotRan(context);

  const batchExchangeContract = await context.getDeployed("BatchExchange");
  const [tokenBaseId, tokenQuoteId] = await Promise.all([
    batchExchangeContract.methods
      .tokenAddressToIdMap(tokenBaseContract.options.address)
      .call(),
    batchExchangeContract.methods
      .tokenAddressToIdMap(tokenQuoteContract.options.address)
      .call(),
  ]);

  const dividendForBounds = new Decimal(10).pow(
    tokenBaseDetails.decimals.toString()
  );

  const orderTransactions = await transactionsForOrders(
    context.safeInfo.safeAddress,
    safeAddresses,
    tokenBaseId,
    tokenQuoteId,
    new Decimal(boundsLowerWei.toString()).div(dividendForBounds).toNumber(),
    new Decimal(boundsUpperWei.toString()).div(dividendForBounds).toNumber(),
    true
  );

  const fundTransactions = await transactionsForTransferApproveDepositFromOrders(
    context.safeInfo.safeAddress,
    safeAddresses,
    tokenBaseContract.options.address,
    tokenQuoteContract.options.address,
    boundsLowerWei,
    boundsUpperWei,
    currentPriceWei,
    investmentQuoteWei,
    investmentBaseWei,
    false
  );

  return {
    txs: [...orderTransactions, ...fundTransactions],
  };
};

export default orderAndFund;
