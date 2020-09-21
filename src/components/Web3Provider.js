import React, { useEffect, useCallback, useState, useMemo } from "react";

import initWeb3 from "utils/initWeb3";
import getLogger from "utils/logger";

import PropTypes from "prop-types";

import initSdk from "@gnosis.pm/safe-apps-sdk";

import { getTokenAddressesForNetwork } from "../api/tokenAddresses";

import { getImageUrl } from "utils/misc";

const logger = getLogger("web3-provider");

export const Web3Context = React.createContext({
  instance: null,
  status: "UNKNOWN",
});

let globalArtifacts = {}; // Cache of artifacts for getCachedArtifact
let globalArtifactPromises = {}; // Cache of promises for getArtifact
let globalDeployedContracts = {}; // Cache of Contracts by NetworkID for getDeployed
let globalContractsByAddress = {}; // Cache of Contracts by Address for getContract

const readContractJSON = async (contractName) => {
  const contractArtifact = await import(`contracts/${contractName}.json`);
  return contractArtifact;
};

const Web3Provider = ({ children }) => {
  const [status, setStatus] = useState("UNKNOWN");
  const [instance, setInstance] = useState(null);
  const [sdk, setSdk] = useState(null);
  const [safeInfo, setSafeInfo] = useState({});
  const [erc20Cache, setErc20Cache] = useState({});

  const handleSafeInfo = useCallback(
    (safeInfo) => {
      setSafeInfo(safeInfo);
      logger.log(`Safe connection established`, safeInfo);
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

      if (safeInfo?.safeAddress) {
        setStatus("SUCCESS");
      }

      return () => {
        sdk.removeListeners();
      };
    }
  }, [sdk, safeInfo, handleSafeInfo]);

  const handleAsyncInit = useCallback(() => {
    handleInit();
  }, [handleInit]);

  const handleGetArtifact = useCallback(async (dirtyContractName) => {
    // This removes file endings, because IProxy.sol and IProxy are the same
    const contractName = dirtyContractName.replace(/\..*/, "");
    if (!globalArtifacts[contractName]) {
      // Load from default folder with contractName.json
      globalArtifactPromises[contractName] = readContractJSON(contractName);

      // Await the result to make sure it gets added the globalArtifacts
      globalArtifacts[contractName] = await globalArtifactPromises[
        contractName
      ];
    }
    return await globalArtifacts[contractName];
  }, []);

  const handleGetCachedArtifact = useCallback((contractName) => {
    if (!globalArtifacts[contractName]) {
      throw new Error(
        `${contractName} has not been fetched previously. Please fetch it before running the part of the application that is using artifacts.require`
      );
    }

    return globalArtifacts[contractName];
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

      if (!globalContractsByAddress[contractName]) {
        globalContractsByAddress[contractName] = {};
      }

      if (!globalContractsByAddress[contractName][contractAddress]) {
        const contractInstance = new instance.eth.Contract(
          contractArtifact.abi,
          contractAddress
        );

        contractInstance.setProvider(instance.currentProvider);

        // FIXME: Bad Monkeypatching
        // Allows us to access the contracts saved artifact later by referencing it by the contractname. Contractnames need to be unique.
        contractInstance.contractName = contractName;

        globalContractsByAddress[contractName][
          contractAddress
        ] = contractInstance;
      }

      return globalContractsByAddress[contractName][contractAddress];
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

      if (!globalDeployedContracts[networkId]) {
        globalDeployedContracts[networkId] = {};
      }

      if (!globalDeployedContracts[networkId][contractName]) {
        const networkDeploymentInfo = contractArtifact.networks[networkId];
        if (!networkDeploymentInfo) {
          throw new Error(
            "Not deployed on current network according to build artifacts. Add address or update artifact"
          );
        }
        globalDeployedContracts[networkId][contractName] = handleGetContract(
          contractName,
          networkDeploymentInfo.address
        );
      }
      return globalDeployedContracts[networkId][contractName];
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
        (async () => {
          const decimalsString = await contractInstance.methods
            .decimals()
            .call();
          return parseInt(decimalsString, 10);
        })(),
        contractInstance.methods.symbol().call(),
        contractInstance.methods.name().call(),
      ]);

      // console.log(`details`, decimals, symbol, name);
      return {
        address,
        decimals,
        symbol,
        name,
        imageUrl: getImageUrl(address),
      };
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
        tokenAddresses.map(handleGetErc20Details)
      );

      setErc20Cache(
        erc20Details.reduce(
          (acc, tokenDetails) => ({
            ...acc,
            [tokenDetails.address]: tokenDetails,
          }),
          {}
        )
      );
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

  logger;

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
