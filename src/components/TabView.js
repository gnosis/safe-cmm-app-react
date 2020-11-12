import React, { useCallback, useContext, useMemo, useState } from "react";
import { Tab } from "@gnosis.pm/safe-react-components";

import { TabHeaderWithCounter } from "components/navigation/tabs/TabHeaderWithCounter";

import Strategies from "routes/Strategies";
import Deploy from "routes/Deploy";

import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import { useRecoilValue } from "recoil";

import { totalStrategyCount } from "state/selectors/strategyCounter";

const TAB_MENU_ENTRIES = [
  {
    id: "deployment",
    label: "Deploy",
    component: Deploy,
  },
  {
    id: "strategies",
    label: "Strategies",
    component: Strategies,
  },
];

const TAB_ENTRIES_BY_ID = {};
TAB_MENU_ENTRIES.forEach((entry) => (TAB_ENTRIES_BY_ID[entry.id] = entry));

const DEFAULT_TAB = "deployment";

const TabView = () => {
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

  const tabEntries = useMemo(() => {
    const newEntries = [...TAB_MENU_ENTRIES];
    newEntries[1].label = (
      <TabHeaderWithCounter count={strategyCount}>
        Strategies
      </TabHeaderWithCounter>
    );
    return newEntries;
  }, [strategyCount]);

  return (
    <>
      <Tab
        items={tabEntries}
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
};

export default TabView;
