import React, { useEffect, useCallback, useState, useMemo } from "react";
import initWeb3 from "../utils/initWeb3";

import PropTypes from "prop-types";

import initSdk from "@gnosis.pm/safe-apps-sdk";

import { getTokenAddressesForNetwork } from "../api/tokenAddresses";

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
  const [erc20Cache, setErc20Cache] = useState({});

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

      if (safeInfo) {
        setStatus("SUCCESS");
      }

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
      const cleanedContractName = contractName.replace(/\.sol/, "");
      const response = await fetch(`contracts/${cleanedContractName}.json`);
      contractArtifact = await response.json();
      contractArtifacts[contractName] = contractArtifact;
    }

    return contractArtifact;
  }, []);

  const handleGetCachedArtifact = useCallback((contractName) => {
    if (!contractArtifacts[contractName]) {
      throw new Error(
        `${contractName} has not been fetched previously. Please fetch it before running the part of the application that is using artifacts.require`
      );
    }
    return contractArtifacts[contractName];
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

  /**
   * Fetches erc20 token details from contract
   *
   * @param {string} address - The erc20 token address
   * @returns {object} - Erc20 token details (decimals, name, symbol, address)
   */
  const handleGetErc20Details = useCallback(
    async (address) => {
      const contractInstance = await handleGetContract(
        "ERC20Detailed",
        address
      );

      const [decimals, symbol, name] = await Promise.all([
        contractInstance.methods.decimals().call(),
        contractInstance.methods.symbol().call(),
        contractInstance.methods.name().call(),
      ]);

      console.log(`details`, decimals, symbol, name);
      return { address, decimals, symbol, name };
    },
    [handleGetContract]
  );

  /**
   * Fetches erc20 token details from local cache if existing or contract if not
   *
   * @param {string} address - The erc20 token address
   * @returns {object} - Erc20 token details (decimals, name, symbol, address)
   */
  const handleGetErc20FromCache = useCallback(
    async (address) => {
      if (erc20Cache[address]) {
        return erc20Cache[address];
      }
      const details = await handleGetErc20Details(address);

      setErc20Cache((cache) => ({ ...cache, [address]: details }));

      return details;
    },
    [erc20Cache, handleGetErc20Details]
  );

  /*
   */

  useEffect(handleAsyncInit, [handleAsyncInit]);

  // Loads erc20 details for all tokens addresses for given network on load
  useEffect(() => {
    if (!instance) {
      return;
    }

    async function loadErc20Details() {
      const tokenAddresses = await getTokenAddressesForNetwork(
        await instance.eth.net.getId()
      );

      const erc20Details = await Promise.all(
        tokenAddresses.map((address) => handleGetErc20Details(address))
      );
      setErc20Cache(erc20Details);
    }

    loadErc20Details();
  }, [handleGetErc20Details, instance]);

  const tokenList = useMemo(() => Object.values(erc20Cache), [erc20Cache]);

  const contextState = useMemo(
    () => ({
      status,
      instance,
      sdk,
      safeInfo,
      getArtifact: handleGetArtifact,
      getCachedArtifact: handleGetCachedArtifact,
      tokenList,
      getContract: handleGetContract,
      getDeployed: handleGetDeployed,
      getErc20Details: handleGetErc20FromCache,
    }),
    [
      status,
      instance,
      safeInfo,
      sdk,
      tokenList,
      handleGetContract,
      handleGetArtifact,
      handleGetCachedArtifact,
      handleGetDeployed,
      handleGetErc20FromCache,
    ]
  );

  console.log(safeInfo);

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
