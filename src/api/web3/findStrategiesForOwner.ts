import { Web3Context } from "types"
import Strategy from 'logic/strategy';

const findStrategiesForOwner = async (context : Web3Context) : Promise<Strategy[]> => {
  const {
    safeInfo: { safeAddress: owner },
    getDeployed,
    getContract,
    instance: web3
  } = context
  const fleetFactory = await getDeployed('FleetFactoryDeterministic');
  const fleetDeployEvents = await fleetFactory.getPastEvents('FleetDeployed', { fromBlock: 0, toBlock: "latest" })

  const strategies : Strategy[] = await Promise.all(
    fleetDeployEvents.map(async (fleetDeployEvent) : Promise<Strategy> => {
      const strategy = new Strategy(fleetDeployEvent);

      await strategy.fetchAllPossibleInfo(context);
      return strategy;
    })
  )

  /*


  console.log(strategyDeployedEvents)

  let tokenAddressesFound = {}

  const strategies = await Promise.all(
    strategyDeployedEvents.map(async ({ transactionHash, blockNumber, blockHash, returnValues: { fleet } }) => {
      const transaction = await web3.eth.getTransactionReceipt(transactionHash)
      console.log(transaction)
      const block = await web3.eth.getBlock(blockNumber);
      const brackets = await Promise.all(
        fleet.map(async (address) => {
          const bracketContract = await getContract('GnosisSafe', address);
          return bracketContract
        })
      )
      
      const exchangeEvents = await exchange.getPastEvents('allEvents', { fromBlock: blockNumber, toBlock: blockNumber })
      console.log(exchangeEvents)

      return {
        blockHash,
        brackets,
        exchangeEvents,
        block,
      };
    })
  )
  */

  return strategies
}

export default findStrategiesForOwner;
