import React, { useEffect, useContext, useCallback } from "react";

import findPendingStrategiesForOwner from "api/safe/findPendingStrategiesForOwner";

import { Web3Context } from "components/Web3Provider";

const Pending = () => {
  const context = useContext(Web3Context);
  const handleLoadPending = useCallback(async () => {
    const pendingStrategies = await findPendingStrategiesForOwner(context);
    console.log(pendingStrategies);
  }, [context]);
  useEffect(() => {
    handleLoadPending();
  }, [handleLoadPending]);
  return <div>Pending strategies</div>;
};

export default Pending;
