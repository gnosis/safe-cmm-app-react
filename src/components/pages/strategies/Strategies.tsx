import React, { memo, useMemo } from "react";

import { Tabs, TabConfiguration } from "components/navigation/tabs/Tabs";

import { Active } from "./Active";
//import { Pending } from "./Pending";
import Pending from "routes/Strategies/Pending";
import Closed from "routes/Strategies/Deactivated";

const DEFAULT_TAB = "active";

export const Strategies = memo(function Strategies(): JSX.Element {
  /*
  const history = useHistory();
  const { match } = useLocation();

  const [selectedTab, setSelectedTab] = useState(DEFAULT_TAB);
  const handleChangeTab = useCallback(
    (id) => {
      history.replace(`${match.path}/${id}`);
      setSelectedTab(id);
    },
    [history, setSelectedTab]
  );
  */

  const tabConfiguration: TabConfiguration[] = useMemo(
    () => [
      {
        name: "active",
        label: "Active",
        tabHeaderProps: {},
        component: Active,
      },
      {
        name: "pending",
        label: "Pending",
        tabHeaderProps: {},
        component: Pending,
      },
      {
        name: "closed",
        label: "Closed",
        tabHeaderProps: {},
        component: Closed,
      },
    ],
    []
  );

  return (
    <>
      <Tabs tabs={tabConfiguration} defaultTab={DEFAULT_TAB} />
    </>
  );
});
