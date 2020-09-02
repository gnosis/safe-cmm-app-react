import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { ButtonLink } from "@gnosis.pm/safe-react-components";
import { Switch, Route, useHistory } from "react-router-dom";

import Active from "./Active";
import Pending from "./Pending";
import Deactivated from "./Deactivated";
import { Box } from "@material-ui/core";
import styled from "styled-components";

const SubNavigationBar = styled(Box)`
  display: flex;
  width: auto;
  height: 32px;
`;

const NavButtonLink = styled(ButtonLink)`
  text-decoration: none;
`;

const STRATEGY_TAB_ITEMS = [
  {
    id: "active",
    label: "Active",
  },
  {
    id: "pending",
    label: "Pending",
  },
  {
    id: "deactivated",
    label: "Deactivated",
  },
];
const Strategies = ({ match }) => {
  const history = useHistory();
  const [selectedSubTab, setSelectedSubTab] = useState("active");
  const handleSelectTab = useCallback(
    (id, e) => {
      e.preventDefault();
      history.replace(`${match.path}/${id}`);
      setSelectedSubTab(id);
    },
    [history, setSelectedSubTab, match]
  );

  const makeTabSelector = useCallback((id) => (e) => handleSelectTab(id, e), [
    handleSelectTab,
  ]);

  return (
    <>
      <SubNavigationBar>
        {STRATEGY_TAB_ITEMS.map(({ id, label }) => (
          <NavButtonLink
            key={id}
            onClick={makeTabSelector(id)}
            color={selectedSubTab === id ? "primary" : "#000"}
            textSize="xl"
          >
            {label}
          </NavButtonLink>
        ))}
      </SubNavigationBar>
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
