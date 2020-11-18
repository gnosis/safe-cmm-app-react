import { findSafeTransactionsForPendingStrategies } from "api/safe/findSafeTransactionsForPendingStrategies";
import { findFleetDeployEvents } from "api/web3/findFleetDeployEvents";
import { EventStrategy } from "logic/EventStrategy";
import { SafeStrategy } from "logic/SafeStrategy";
import { useCallback, useContext, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { strategiesState } from "state/atoms";
import { StrategyState } from "types";
import { ContractInteractionContext } from "components/context/ContractInteractionProvider";

type StatusEnum = "LOADING" | "ERROR" | "SUCCESS";

interface StrategiesContextProps {
  status: StatusEnum;
  strategiesByStatus: Record<string, Array<EventStrategy | SafeStrategy>>;
  strategies: Array<EventStrategy | SafeStrategy>;
}

export const StrategyLoader = (): JSX.Element => {
  const setStrategiesState = useSetRecoilState(strategiesState);

  const makeStrategySetter = useCallback(
    (transactionHash: string) => (data: Partial<StrategyState>): void => {
      setStrategiesState((strategies: Record<string, StrategyState>) => ({
        ...strategies,
        [transactionHash]: {
          ...strategies[transactionHash],
          ...data,
        },
      }));
    },
    [setStrategiesState]
  );

  const context = useContext(ContractInteractionContext);

  const loadEventStrategies = useCallback(async () => {
    const events = await findFleetDeployEvents(context);

    const newStrategies = events.map(
      (fleetDeployEvent) =>
        new EventStrategy(
          fleetDeployEvent,
          makeStrategySetter(fleetDeployEvent.transactionHash)
        )
    );
    return newStrategies;
  }, [context, makeStrategySetter]);

  const loadSafeStrategies = useCallback(async () => {
    const txLogs = await findSafeTransactionsForPendingStrategies(context);

    const newStrategies = txLogs.map(
      (txLog) => new SafeStrategy(txLog, makeStrategySetter(txLog.safeTxHash))
    );
    return newStrategies;
  }, [context, makeStrategySetter]);

  useEffect(() => {
    // TODO: Only loads once for now. Logic to determine which strategies updated neeeded
    Promise.all([loadEventStrategies(), loadSafeStrategies()])
      .then(([eventStrategies, safeStrategies]) => {
        console.log("loaded strategies");

        // Kick-off Async tasks
        return Promise.all(
          [...safeStrategies, ...eventStrategies].map(async (strategy) => {

            try {
              await strategy.readFunding(context);
              await strategy.readStatus(context);
              await strategy.readBalances(context);
            } catch (err) {
              console.error(
                `Strategy failed to load ${strategy.transactionHash}: ${err.message}`
              );
              console.error(err);
            }
            //console.log(`Async load ${strategy.transactionHash} finished`);
          })
        );

        console.log(eventStrategies);
      })
      .catch((err) => {
        console.error("Strategies could not be loaded", err);
      });
    // eslint-disable-next-line
  }, [/* purposefully left empty, as to only load once */, "hot"]);

  return null;
};
