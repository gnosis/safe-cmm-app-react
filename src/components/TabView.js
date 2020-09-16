import React, { useCallback, useState } from "react";
import { Tab } from "@gnosis.pm/safe-react-components";

import Strategies from "routes/Strategies";
// import Deploy from "routes/Deploy";
import { DeployPage } from "components/pages/deploy";

import { Route, Switch, Redirect, useHistory } from "react-router-dom";

const TAB_MENU_ENTRIES = [
  {
    id: "deployment",
    label: "Deploy",
    component: DeployPage,
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
        <Route path="/deployment" component={DeployPage} />
        <Route path="/strategies" component={Strategies} />
        <Redirect to={`/${DEFAULT_TAB}`} />
      </Switch>
    </>
  );
};

export default TabView;
