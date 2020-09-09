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

const withdrawFunds = async (context : Web3Context, strategy : Strategy) : Promise<any> => {
  const contracts = await Promise.all([
    context.getArtifact("IProxy"),
    context.getArtifact("GnosisSafe"),
    context.getArtifact("IProxy"),
    context.getArtifact("MultiSend"),
    context.getArtifact("BatchExchange"),
    context.getArtifact("FleetFactory"),
    //context.getArtifact("FleetFactoryDeterministic"),
  ]);
  
  const withdrawHelpers = runInitializerIfNotRan(context);

  const withdrawTransactions = await withdrawHelpers.prepareWithdrawAndTransferFundsToMaster( // prepareTransferFundsToMaster
    {
      masterSafe: context.safeInfo.safeAddress,
      brackets: strategy.brackets.map(bracket => bracket.address),
      tokenIds: [strategy.baseTokenId, strategy.quoteTokenId],
    }, true
  )
  console.log(withdrawTransactions)
  
  return {
    txs: withdrawTransactions
  }

}

export default withdrawFunds;