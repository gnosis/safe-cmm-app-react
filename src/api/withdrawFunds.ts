import withdrawHelperInit from "@gnosis.pm/dex-liquidity-provision/scripts/wrapper/withdraw";
import makeFakeArtifacts from "utils/makeFakeArtifacts";
import { Web3Context } from 'types';
import Strategy from 'logic/strategy';

let initializedWithdrawHelpers;

const runInitializerIfNotRan = (context) : any => {
  if (!initializedWithdrawHelpers) {
    initializedWithdrawHelpers = withdrawHelperInit(
      context.instance,
      makeFakeArtifacts(context)
    )
  }
  return initializedWithdrawHelpers;
}

export const withdrawRequest = async (context : Web3Context, strategy : Strategy) : Promise<any> => {
  const contracts = await Promise.all([
    context.getArtifact("IProxy"),
    context.getArtifact("GnosisSafe"),
    context.getArtifact("MultiSend"),
    context.getArtifact("BatchExchange"),
    context.getArtifact("FleetFactory"),
  ]);
  
  const withdrawHelpers = runInitializerIfNotRan(context);

  const withdrawTransactions = await withdrawHelpers.prepareWithdrawRequest( // prepareTransferFundsToMaster
    {
      masterSafe: context.safeInfo.safeAddress,
      brackets: strategy.brackets.map(bracket => bracket.address),
      tokens: [strategy.baseTokenAddress, strategy.quoteTokenAddress],
    }, true
  )
  console.log(withdrawTransactions)
  
  return {
    txs: withdrawTransactions
  }

}

export const withdrawClaim = async (context : Web3Context, strategy : Strategy) : Promise<any> => {
  const contracts = await Promise.all([
    context.getArtifact("IProxy"),
    context.getArtifact("GnosisSafe"),
    context.getArtifact("MultiSend"),
    context.getArtifact("BatchExchange"),
    context.getArtifact("FleetFactory"),
  ]);
  
  const withdrawHelpers = runInitializerIfNotRan(context);

  const argv = {
    masterSafe: context.safeInfo.safeAddress,
    brackets: strategy.brackets.map(bracket => bracket.address),
    tokens: [strategy.baseTokenAddress, strategy.quoteTokenAddress],
  };

  const withdrawTransactions = await withdrawHelpers.prepareWithdraw(argv, true)
  const withdrawTransferTransaction = await withdrawHelpers.prepareWithdrawAndTransferFundsToMaster(argv, true)

  console.log({
    claim: withdrawTransactions,
    transfer: withdrawTransferTransaction,
  });

  return {
    txs: [...withdrawTransactions, ...withdrawTransferTransaction]
  }

}