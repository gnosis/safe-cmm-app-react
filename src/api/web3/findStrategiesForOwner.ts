import { Web3Context } from "types";
import Strategy from "logic/strategy";

const findStrategiesForOwner = async (
  context: Web3Context
): Promise<Strategy[]> => {
  const {
    safeInfo: { safeAddress: owner },
    getDeployed,
  } = context;
  const fleetFactory = await getDeployed("FleetFactoryDeterministic");
  const fleetDeployEvents = await fleetFactory.getPastEvents("FleetDeployed", {
    fromBlock: 0,
    toBlock: "latest",
    filter: { owner },
  });

  const strategies: Strategy[] = await Promise.all(
    fleetDeployEvents.map(
      async (fleetDeployEvent): Promise<Strategy> => {
        const strategy = new Strategy(fleetDeployEvent);

        await strategy.fetchAllPossibleInfo(context);
        return strategy;
      }
    )
  );

  return strategies;
};

export default findStrategiesForOwner;
