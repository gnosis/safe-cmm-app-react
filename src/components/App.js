import React from "react";
import { hot } from "react-hot-loader/root";
import { RecoilRoot } from "recoil";
import { Version } from "./Version";

import { theme } from "theme";

import { BrowserRouter as Router } from "react-router-dom";

import { ContractInteractionProvider } from "components/context/ContractInteractionProvider";
import { StrategyLoader } from "components/StrategyLoader";

import GlobalStyle from "./GlobalStyle";
import { TabView } from "./TabView";
import { ThemeProvider as StyledComponentThemeProvider } from "styled-components";

const App = () => {
  return (
    // This is not the Material-UI Theme provider. Theming with makeStyle,
    // useStyles and other styling methods from Material-UI will not work!
    <StyledComponentThemeProvider theme={theme}>
      <Version />
      <GlobalStyle />
      <RecoilRoot>
        <ContractInteractionProvider>
          <StrategyLoader />
          <Router>
            <TabView />
          </Router>
        </ContractInteractionProvider>
      </RecoilRoot>
    </StyledComponentThemeProvider>
  );
};

export default hot(App);
