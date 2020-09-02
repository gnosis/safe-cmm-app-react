import React from "react";
import { hot } from "react-hot-loader/root";

import { ThemeProvider } from "styled-components";
import { theme } from "@gnosis.pm/safe-react-components";

import { BrowserRouter as Router } from "react-router-dom";

import Web3Provider from "./Web3Provider";

import GlobalStyle from "./GlobalStyle";
import TabView from "./TabView";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Web3Provider>
        <Router>
          <TabView />
        </Router>
      </Web3Provider>
    </ThemeProvider>
  );
};

export default hot(App);
