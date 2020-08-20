import React, { useEffect, useCallback, useState, useMemo } from "react";
import initWeb3 from "../utils/initWeb3";

import PropTypes from "prop-types";

import initSdk from "@gnosis.pm/safe-apps-sdk";

export const Web3Context = React.createContext({
  instance: null,
  status: "UNKNOWN",
});

// Saves artifacts on a contract name base, allows us to re-use previously initialized contracts
const contractArtifacts = {};

const Web3Provider = ({ children }) => {
  const [status, setStatus] = useState("UNKNOWN");
  const [instance, setInstance] = useState(null);
  const [sdk, setSdk] = useState(null);
  const [safeInfo, setSafeInfo] = useState({});

  const handleSafeInfo = useCallback(
    (safeInfo) => {
      setSafeInfo(safeInfo);
      setStatus("SUCCESS");
    },
    [setSafeInfo, setStatus]
  );

  const handleInit = useCallback(async () => {
    setStatus("LOADING");

    try {
      const newInstance = await initWeb3();
      setInstance(newInstance);
      setSdk(initSdk());
    } catch (err) {
      console.error(err);
      setInstance(null);
      setStatus("ERROR");
    }
  }, []);

  useEffect(() => {
    if (sdk) {
      sdk.addListeners({
        onSafeInfo: handleSafeInfo,
      });

      return () => {
        sdk.removeListeners();
      };
    }
  }, [sdk, handleSafeInfo]);

  const handleAsyncInit = useCallback(() => {
    handleInit();
  }, [handleInit]);

  const handleGetArtifact = useCallback(async (contractName) => {
    let contractArtifact = contractArtifacts[contractName];
    if (!contractArtifact) {
      // Load from default folder with contractName.json
      const response = await fetch(`contracts/${contractName}.json`);
      contractArtifact = await response.json();
      contractArtifacts[contractName] = contractArtifact;
    }

    return contractArtifact;
  }, []);

  /**
   * Instance a web3 contract instance for the contract with the supplied name.
   *
   * @param {String} contractName - Name of contract to be loaded. Will be opened from `/build/contracts/<contractName>.json`
   * @param {String} contractAddress - Address of the contract to load. If not applicable, leave undefined or null.
   * @returns {web3.eth.Contract} Contractinstance
   */
  const handleGetContract = useCallback(
    async (contractName, contractAddress = null) => {
      const contractArtifact = await handleGetArtifact(contractName);

      const contractInstance = new instance.eth.Contract(
        contractArtifact.abi,
        contractAddress
      );
      contractInstance.setProvider(instance.currentProvider); // Connected to Infura

      // FIXME: Bad Monkeypatching
      // Allows us to access the contracts saved artifact later by referencing it by the contractname. Contractnames need to be unique.
      contractInstance.contractName = contractName;
      return contractInstance;
    },
    [handleGetArtifact, instance]
  );

  /**
   * Loads a contract instance with the current networks deployed address
   *
   * @param {string} contractName - Contractname to load the deployed instance for
   * @returns {web3.eth.Contract} - Contractinstance
   */
  const handleGetDeployed = useCallback(
    async (contractName) => {
      const contractArtifact = await handleGetArtifact(contractName);

      const networkId = await instance.eth.net.getId();
      console.log(contractArtifact);
      const networkDeploymentInfo = contractArtifact.networks[networkId];
      if (!networkDeploymentInfo) {
        throw new Error(
          "Not deployed on current network according to build artifacts. Add address or update artifact"
        );
      }
      return handleGetContract(contractName, networkDeploymentInfo.address);
    },
    [handleGetContract, handleGetArtifact, instance]
  );

  useEffect(handleAsyncInit, [handleAsyncInit]);

  const contextState = useMemo(
    () => ({
      status,
      instance,
      sdk,
      safeInfo,
      getContract: handleGetContract,
      getDeployed: handleGetDeployed,
    }),
    [status, instance, safeInfo, sdk, handleGetContract, handleGetDeployed]
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
