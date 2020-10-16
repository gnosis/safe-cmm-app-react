import React, { memo, useState, useMemo } from "react";

import styled, { useTheme } from "styled-components";

import {
  Props as TabHeaderProps,
  TabHeaderWithCounter,
} from "components/navigation/tabs/TabHeaderWithCounter";
import { Box } from "@material-ui/core";
import { Divider } from "@gnosis.pm/safe-react-components";

const TabHeaderWithDivider = styled(Box)`
  display: flex;
  flex-direction: row;
`;
const TabButtonContainer = styled(Box)`
  display: flex;
  margin-top: 12px;
  flex-direction: row;
`;

const TabActiveContainer = styled(Box)`
  display: flex;
  margin-top: 12px;
  width: 100%;
`;

const TabsContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export interface TabConfiguration {
  name: string;
  label: string;
  tabHeaderProps: TabHeaderProps;
  component: () => JSX.Element;
}

export interface Props {
  tabs: TabConfiguration[];
  defaultTab: string;
  activeTabButtonBgColor?: string;
  activeTabButtonTextColor?: string;
  inactiveTabButtonBgColor?: string;
  inactiveTabButtonTextColor?: string;
}

export const Tabs = memo(function Tabs({
  tabs,
  defaultTab,
  activeTabButtonBgColor,
  activeTabButtonTextColor,
  inactiveTabButtonBgColor,
  inactiveTabButtonTextColor,
}: Props): JSX.Element {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(
    (): string => defaultTab || tabs[0].name
  );

  const ActiveTabComponent = useMemo(
    () =>
      tabs.find(({ name }: TabConfiguration) => name === activeTab).component,
    [tabs, activeTab]
  );

  return (
    <TabsContainer>
      <TabButtonContainer>
        {tabs.map(
          (
            { name, label, tabHeaderProps }: TabConfiguration,
            index: number
          ) => {
            return (
              <TabHeaderWithDivider key={name}>
                <TabHeaderWithCounter
                  name={name}
                  active={activeTab === name}
                  activeBgColor={activeTabButtonBgColor || theme.colors.primary}
                  activeTextColor={
                    activeTabButtonTextColor || theme.colors.white
                  }
                  inactiveBgColor={inactiveTabButtonBgColor || "#f3f3f3"}
                  inactiveTextColor={inactiveTabButtonTextColor || "#000"}
                  onClick={setActiveTab}
                  {...tabHeaderProps} // count, onClick, hasDot
                >
                  {label}
                </TabHeaderWithCounter>
                {index !== tabs.length - 1 && (
                  <Divider orientation="vertical" />
                )}
              </TabHeaderWithDivider>
            );
          }
        )}
      </TabButtonContainer>
      <TabActiveContainer>
        <ActiveTabComponent />
      </TabActiveContainer>
    </TabsContainer>
  );
});
