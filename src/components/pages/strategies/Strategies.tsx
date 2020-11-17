import React, { memo, useMemo } from "react";

import { Tabs, TabConfiguration } from "components/navigation/tabs/Tabs";

import { Active } from "./Active";
import { Pending } from "./Pending";

import Closed from "routes/Strategies/Deactivated";
import { useRecoilValue } from "recoil";
import { strategyCountByStatus } from "state/selectors/strategyCounter";

const DEFAULT_TAB = "active";

export const Strategies = memo(function Strategies(): JSX.Element {
  const activeCount = useRecoilValue(strategyCountByStatus("ACTIVE"));
  const pendingCount = useRecoilValue(strategyCountByStatus("PENDING"));
  const closedCount = useRecoilValue(strategyCountByStatus("CLOSED"));
  const tradingStoppedCount = useRecoilValue(
    strategyCountByStatus("TRADING_STOPPED")
  );

  const tabConfiguration: TabConfiguration[] = useMemo(
    () => [
      {
        name: "active",
        label: "Active",
        tabHeaderProps: {
          count: activeCount,
        },
        component: Active,
      },
      {
        name: "pending",
        label: "Pending",
        tabHeaderProps: {
          count: pendingCount,
        },
        component: Pending,
      },
      {
        name: "closed",
        label: "Closed",
        tabHeaderProps: {
          hasDot: tradingStoppedCount > 0,
          count: closedCount + tradingStoppedCount,
        },
        component: Closed,
      },
    ],
    [activeCount, pendingCount, closedCount, tradingStoppedCount]
  );

  return <Tabs tabs={tabConfiguration} defaultTab={DEFAULT_TAB} />;
});
