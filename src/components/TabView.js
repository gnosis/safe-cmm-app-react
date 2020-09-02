import React, { useCallback, useState } from "react";
import { Tab } from "@gnosis.pm/safe-react-components";

import Strategies from "routes/Strategies";
import Deploy from "routes/Deploy";

import { Route, Switch, Redirect, useHistory } from "react-router-dom";

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
  console.log(history);

  const [selectedTab, setSelectedTab] = useState(DEFAULT_TAB);
  const handleChangeTab = useCallback(
    (targetTabId) => {
      setSelectedTab(targetTabId);
      history.replace(`/${targetTabId}`);
    },
    [history, setSelectedTab]
  );

  return (
    <>
      <Tab
        items={TAB_MENU_ENTRIES}
        selectedTab={selectedTab}
        onChange={handleChangeTab}
        variant="outlined"
      />
      <Switch>
        <Route path="/strategies" component={Strategies} />
        <Route path="/deployment" component={Deploy} />
        <Redirect to={`/${DEFAULT_TAB}`} />
      </Switch>
    </>
  );
};

export default TabView;
