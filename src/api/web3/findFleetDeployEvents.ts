import { ContractInteractionContextProps } from "components/context/ContractInteractionProvider";

const findFleetEventsFrom = async (
  factoryName: string,
  owner: string,
  getDeployed: (contractName: string) => Promise<any>
) => {
  const factory = await getDeployed(factoryName);
  const events = await factory.getPastEvents("FleetDeployed", {
    fromBlock: 0,
    toBlock: "latest",
    filter: { owner },
  });

  return events;
};

export const findFleetDeployEvents = async (
  context: ContractInteractionContextProps
): Promise<any[]> => {
  const {
    safeInfo: { safeAddress: owner },
    getDeployed,
  } = context;

  const events = await Promise.all([
    findFleetEventsFrom("FleetFactoryDeterministic", owner, getDeployed),
    findFleetEventsFrom("FleetFactory", owner, getDeployed),
  ]);

  return events.flat();
};
