import { findSafeTransactionsForPendingStrategies } from "api/safe/findSafeTransactionsForPendingStrategies";
import { findFleetDeployEvents } from "api/web3/findFleetDeployEvents";
import { EventStrategy } from "logic/EventStrategy";
import {
  PendingStrategySafeTransaction,
  SafeStrategy,
} from "logic/SafeStrategy";
import { useCallback, useContext, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { strategiesLoadingState, strategiesState } from "state/atoms";
import { StrategyState } from "types";
import { ContractInteractionContext } from "components/context/ContractInteractionProvider";

import getLogger from "utils/logger";
import { debounce } from "lodash";

const logger = getLogger("strategy-loader");

type StatusEnum = "LOADING" | "ERROR" | "SUCCESS";

const addedListeners = false;
let activeStrategyLoadPromise;
export const StrategyLoader = (): JSX.Element => {
  const [strategies, setStrategiesState] = useRecoilState(strategiesState);
  const setStrategiesLoadingState = useSetRecoilState(strategiesLoadingState);

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

    // Only find strategies not yet discovered.
    const newEvents = events.filter(
      (fleetDeployEvent: Record<string, any>) =>
        !strategies[fleetDeployEvent.transactionHash]
    );

    const newStrategies = newEvents.map(
      (fleetDeployEvent) =>
        new EventStrategy(
          fleetDeployEvent,
          makeStrategySetter(fleetDeployEvent.transactionHash)
        )
    );
    return newStrategies;
  }, [context, strategies, makeStrategySetter]);

  const loadSafeStrategies = useCallback(async () => {
    const txLogs = await findSafeTransactionsForPendingStrategies(context);

    // Only find strategies not yet discovered.
    const newTxLogs = txLogs.filter(
      (txLog: PendingStrategySafeTransaction) => !strategies[txLog.safeTxHash]
    );

    const newStrategies = newTxLogs.map(
      (txLog: PendingStrategySafeTransaction) =>
        new SafeStrategy(txLog, makeStrategySetter(txLog.safeTxHash))
    );
    return newStrategies;
  }, [context, strategies, makeStrategySetter]);

  const loadAllStrategies = useCallback(async () => {
    return Promise.all([loadEventStrategies(), loadSafeStrategies()])
      .then(([eventStrategies, safeStrategies]) => {
        if (eventStrategies.length === 0 && safeStrategies.length === 0) {
          // No new strategies found
          return Promise.resolve([]);
        }

        logger.log(
          `New strategies discovered: Active/Closed: ${eventStrategies.length} - Pending: ${safeStrategies.length}`
        );

        // Kick-off Async tasks
        return Promise.all(
          [...safeStrategies, ...eventStrategies].map(async (strategy) => {
            try {
              await strategy.readFunding(context);
              await strategy.readStatus(context);
              await strategy.readBalances(context);
            } catch (err) {
              setStrategiesState((values) => ({
                ...values,
                [strategy.transactionHash]: {
                  ...values[strategy.transactionHash],
                  hasErrored: true,
                },
              }));

              logger.error(
                `Strategy failed to load ${strategy.transactionHash}: ${err.message}`
              );

              logger.error(err);
            }
            //console.log(`Async load ${strategy.transactionHash} finished`);
          })
        );
      })
      .then(() => {
        setStrategiesLoadingState("SUCCESS");
      })
      .catch((err) => {
        setStrategiesLoadingState("ERROR");
        console.error("Strategies could not be loaded", err);
      });
  }, [
    context,
    loadEventStrategies,
    loadSafeStrategies,
    setStrategiesState,
    setStrategiesLoadingState,
  ]);

  useEffect(() => {
    const updater = debounce(() => {
      if (!activeStrategyLoadPromise) {
        logger.log(
          "New block and discovery queue finished, checking for new strategies"
        );
        activeStrategyLoadPromise = loadAllStrategies()
          .then(() => {
            activeStrategyLoadPromise = null;
          })
          .catch((err) => {
            logger.error(err);
            activeStrategyLoadPromise = null;
          });
      }
    }, 1000);
    // Add listener to new block events
    const subscription = context.web3Instance.eth
      .subscribe("newBlockHeaders", (error) => {
        if (error) {
          logger.error(error);
        }
      })
      .on("data", updater);

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, [loadAllStrategies, "hot"]);

  return null;
};
