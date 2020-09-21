import "./wdyr";
import "regenerator-runtime/runtime";

import Decimal from "decimal.js";

import "react-hot-loader";
import { render } from "react-dom";
import React from "react";

import App from "./components/App";

Decimal.set({
  toExpPos: 30,
  toNegPos: 30,
});

const $rootElement = document.getElementById("root");

render(<App />, $rootElement);
