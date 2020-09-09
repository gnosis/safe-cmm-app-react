import React from "react";
import { hot } from "react-hot-loader/root";

import { ThemeProvider } from "styled-components";
import { theme } from "theme";

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

import Web3Provider from "./Web3Provider";

import GlobalStyle from "./GlobalStyle";
import Active from "routes/Active";
import Deploy from "routes/Deploy";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Web3Provider>
        <Router>
          <Switch>
            <Route path="/active" component={Active} />
            <Route path="/deploy" component={Deploy} />
            <Redirect to="/active" />
          </Switch>
        </Router>
      </Web3Provider>
    </ThemeProvider>
  );
};

export default hot(App);
