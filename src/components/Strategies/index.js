import React, { useState } from "react";

import Deploy from "./Deploy";
import List from "./List";

const Strategies = () => {
  const [active] = useState("list");

  let activeComponent;
  if (active === "list") {
    activeComponent = <List />;
  }
  if (active === "deploy") {
    activeComponent = <Deploy />;
  }

  return activeComponent;
};

export default Strategies;
