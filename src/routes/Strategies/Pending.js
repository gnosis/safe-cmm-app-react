import React, { useEffect, useContext, useCallback, useState } from "react";

import findPendingStrategiesForOwner from "api/safe/findPendingStrategiesForOwner";

import { Web3Context } from "components/Web3Provider";

import { Loader } from "@gnosis.pm/safe-react-components";

const Pending = () => {
  const context = useContext(Web3Context);
  const [strategies, setStrategies] = useState(null);
  const handleLoadPending = useCallback(async () => {
    const pendingStrategies = await findPendingStrategiesForOwner(context);
    console.log(pendingStrategies);
  }, [context]);
  useEffect(() => {
    handleLoadPending();
  }, [handleLoadPending]);

  if (!strategies) {
    return (
      <div>
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div>
      {stategies.map((strategy) => {
        return (
          <div key={strategy.transactionHash}>
            <p>{strategy.transactionHash}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Pending;
