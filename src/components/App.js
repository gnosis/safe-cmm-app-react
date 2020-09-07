import React from "react";
import { hot } from "react-hot-loader/root";

import { theme } from "@gnosis.pm/safe-react-components";

import { BrowserRouter as Router } from "react-router-dom";

import Web3Provider from "./Web3Provider";

import GlobalStyle from "./GlobalStyle";
import TabView from "./TabView";
import { ThemeProvider as StyledComponentThemeProvider } from "styled-components";

const App = () => {
  return (
    // This is not the Material-UI Theme provider. Theming with makeStyle,
    // useStyles and other styling methods from Material-UI will not work!
    <StyledComponentThemeProvider theme={theme}>
      <GlobalStyle />
      <Web3Provider>
        <Router>
          <TabView />
        </Router>
      </Web3Provider>
    </StyledComponentThemeProvider>
  );
};

export default hot(App);
