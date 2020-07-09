import React from "react";
import { hot } from "react-hot-loader/root";

import Web3Provider from "./Web3Provider";

import Strategies from "./Strategies";

const App = () => {
  return (
    <Web3Provider>
      <Strategies />
    </Web3Provider>
  );
};

export default hot(App);
