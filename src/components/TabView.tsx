import React, { useCallback, memo, useMemo, useState } from "react";
import { Tab } from "@gnosis.pm/safe-react-components";

import Strategies from "routes/Strategies";
import Deploy from "routes/Deploy";

import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import { useRecoilValue } from "recoil";

import {
  strategyCountByStatus,
  totalStrategyCount,
} from "state/selectors/strategyCounter";
import { SafeStyleTabHeaderWithCounter } from "./navigation/tabs/SafeStyleTabHeaderWithCounter";
import { Badge } from "./basic/display/Badge";

const DEFAULT_TAB = "deployment";

export const TabView = memo(function TabView(): JSX.Element {
  const history = useHistory();

  const strategyCount = useRecoilValue(totalStrategyCount);

  const [selectedTab, setSelectedTab] = useState(DEFAULT_TAB);
  const handleChangeTab = useCallback(
    (targetTabId) => {
      setSelectedTab(targetTabId);
      history.replace(`/${targetTabId}`);
    },
    [history, setSelectedTab]
  );

  // Booleans for notification dot
  const hasTradingStopped =
    useRecoilValue(strategyCountByStatus("TRADING_STOPPED")) > 0;

  const tabs = useMemo(
    () => [
      {
        id: "deployment",
        label: "Deploy",
        component: Deploy,
      },
      {
        id: "strategies",
        label: "Strategies",
        customContent: (
          <SafeStyleTabHeaderWithCounter
            count={strategyCount}
            hasDot={hasTradingStopped}
          >
            Strategies
          </SafeStyleTabHeaderWithCounter>
        ),
        component: Strategies,
      },
    ],
    [strategyCount, hasTradingStopped]
  );

  return (
    <>
      <Tab
        items={tabs}
        selectedTab={selectedTab}
        onChange={handleChangeTab}
        variant="outlined"
      />
      <Switch>
        <Route path="/deployment" component={Deploy} />
        <Route path="/strategies" component={Strategies} />
        <Redirect to={`/${DEFAULT_TAB}`} />
      </Switch>
    </>
  );
});

export default TabView;
