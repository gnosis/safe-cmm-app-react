import React, {
  useCallback,
  memo,
  useMemo,
  useState,
  useContext,
  useEffect,
} from "react";
import { Route, Switch, Redirect, useHistory } from "react-router-dom";
import { useRecoilValue } from "recoil";
import styled from "styled-components";

import { Tab } from "@gnosis.pm/safe-react-components";

import Strategies from "routes/Strategies";
import Deploy from "routes/Deploy";

import { strategyCountByStatus } from "state/selectors/strategyCounter";

import { SafeStyleTabHeaderWithCounter } from "./navigation/tabs/SafeStyleTabHeaderWithCounter";

import { ModalContext } from "./context/ModalProvider";

import storage from "api/storage";

import { Text } from "components/basic/display/Text";

// SafeReactComponents Tab enforces uppercase text for labels
const RegularCaseText = styled(Text)`
  text-transform: none;
`;

const DEFAULT_TAB = "deployment";

let hasDoneModalCheck = false;
export const TabView = memo(function TabView(): JSX.Element {
  const history = useHistory();

  const strategyCount = useRecoilValue(strategyCountByStatus("ACTIVE"));

  const [selectedTab, setSelectedTab] = useState(DEFAULT_TAB);
  const handleChangeTab = useCallback(
    (targetTabId) => {
      setSelectedTab(targetTabId);
      history.replace(`/${targetTabId}`);
    },
    [history, setSelectedTab]
  );

  const { openModal } = useContext(ModalContext);

  const checkForOnboarding = useCallback(async () => {
    const shouldSkipOnboarding = !!(await storage.getItem(
      "skipOnboardingFlow"
    ));

    if (!shouldSkipOnboarding) {
      openModal("Onboarding", { title: "Welcome" });
    }
  }, [openModal]);

  useEffect(() => {
    if (!hasDoneModalCheck) {
      hasDoneModalCheck = true;
      checkForOnboarding();
    }
  }, [checkForOnboarding]);

  // Booleans for notification dot
  const hasTradingStopped =
    useRecoilValue(strategyCountByStatus("TRADING_STOPPED")) > 0;

  const tabs = useMemo(
    () => [
      {
        id: "deployment",
        label: "Deploy",
        component: Deploy,
        customContent: (
          <RegularCaseText
            size="xl"
            color={selectedTab === "deploy" ? "primary" : "text"}
          >
            Deploy
          </RegularCaseText>
        ),
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
    [selectedTab, strategyCount, hasTradingStopped]
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
