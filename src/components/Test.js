import React, { useCallback, useContext } from "react";

import web3 from "web3";

import { Web3Context } from "./Web3Provider";

const Test = () => {
  const { sdk, getContract } = useContext(Web3Context);

  const handleWrapETH = useCallback(async () => {
    const contract = await getContract("WETH9");
    sdk.sendTransactions([
      {
        to: contract.options.address,
        value: 1e18, // 1 ETH
        data: contract.methods.deposit().encodeABI(),
      },
    ]);
  }, [getContract, sdk]);
  const handleUnwrapETH = useCallback(async () => {
    const contract = await getContract("WETH9");
    sdk.sendTransactions([
      {
        to: contract.options.address,
        value: 0,
        data: contract.methods.withdraw(web3.utils.toBN(1e18)).encodeABI(),
      },
    ]);
  }, [getContract, sdk]);

  return (
    <div>
      <button type="button" name="wrap_all_eth" onClick={handleWrapETH}>
        Wrap my ETH
      </button>
      <button type="button" name="unwrap_all_eth" onClick={handleUnwrapETH}>
        Unwrap my ETH
      </button>
    </div>
  );
};

export default Test;
