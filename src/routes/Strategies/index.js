import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Switch, Route, useHistory } from "react-router-dom";

import Active from "./Active";
import Pending from "./Pending";
import Deactivated from "./Deactivated";
import NavBar from "../../components/NavBar";

const STRATEGY_TAB_ITEMS = [
  {
    id: "active",
    label: "Active",
    counter: 4,
  },
  {
    id: "pending",
    label: "Pending",
    counter: 1,
  },
  {
    id: "deactivated",
    label: "Deactivated",
    counter: 1,
  },
];
const Strategies = ({ match }) => {
  const history = useHistory();

  // TODO: Get start tab from `match.path`
  const [selectedTab, setSelectedTab] = useState("active");

  const handleChangeTab = useCallback(
    (id) => {
      history.replace(`${match.path}/${id}`);
      setSelectedTab(id);
    },
    [setSelectedTab, history, match]
  );

  return (
    <>
      <NavBar
        items={STRATEGY_TAB_ITEMS}
        selectedItem={selectedTab}
        onChange={handleChangeTab}
      />
      <Switch>
        <Route path={`${match.path}/active`} component={Active} />
        <Route path={`${match.path}/deactivated`} component={Deactivated} />
        <Route path={`${match.path}/pending`} component={Pending} />
      </Switch>
    </>
  );
};

Strategies.propTypes = {
  match: PropTypes.object,
};

export default Strategies;
