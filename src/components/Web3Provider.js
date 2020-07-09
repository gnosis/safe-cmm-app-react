import React, { useEffect, useCallback, useState, useMemo } from "react";
import initWeb3 from "../utils/initWeb3";

import PropTypes from "prop-types";

import initSdk from "@gnosis.pm/safe-apps-sdk";

export const Web3Context = React.createContext({
  instance: null,
  status: "UNKNOWN",
});

const Web3Provider = ({ children }) => {
  const [status, setStatus] = useState("UNKNOWN");
  const [instance, setInstance] = useState(null);
  const [sdk, setSdk] = useState(null);

  const handleInit = useCallback(async () => {
    setStatus("LOADING");

    try {
      const newInstance = await initWeb3();
      setInstance(newInstance);
      setStatus("SUCCESS");
      setSdk(initSdk());
    } catch (err) {
      console.error(err);
      setInstance(null);
      setStatus("ERROR");
    }
  }, []);

  const handleAsyncInit = useCallback(() => {
    handleInit();
  }, [handleInit]);

  const handleGetContract = useCallback(
    async (contractName, address) => {
      const contractArtifact = await import(`contracts/${contractName}.json`);

      let contractAddress = address;
      if (!address) {
        const networkId = await instance.eth.net.getId();

        if (!contractArtifact.networks[networkId]) {
          throw new Error(
            "Not deployed on current network according to build artifacts. Add address or update artifact"
          );
        }

        contractAddress = contractArtifact.networks[networkId].address;
      }

      return new instance.eth.Contract(contractArtifact.abi, contractAddress);
    },
    [instance]
  );

  useEffect(handleAsyncInit, [handleAsyncInit]);

  const contextState = useMemo(
    () => ({
      status,
      instance,
      sdk,
      getContract: handleGetContract,
    }),
    [status, instance, sdk, handleGetContract]
  );

  return (
    <Web3Context.Provider value={contextState}>
      {status === "SUCCESS" ? children : <p>Loading</p>}
    </Web3Context.Provider>
  );
};

Web3Provider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Web3Provider;
