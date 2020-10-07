import React, { useEffect, useCallback, useState, useMemo } from "react";
import BN from "bn.js";

import initWeb3 from "utils/initWeb3";
import getLogger from "utils/logger";

import PropTypes from "prop-types";

import initSdk from "@gnosis.pm/safe-apps-sdk";

import { getTokenAddressesForNetwork } from "../api/tokenAddresses";
import { getBalances } from "../api/safe";

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
  const [safeInfo, setSafeInfo] = useState(null);
  const [erc20Cache, setErc20Cache] = useState({});

  const handleInitSdk = useCallback(async () => {
    const newInstance = await initSdk();
    setSdk(newInstance);

    const newSafeInfo = await new Promise((resolve, reject) => {
      if (safeInfo) {
        // this only occours on dev hot-reload
        // addListeners only fires once. if it has fired before,
        // the callback below will never complete :(
        return resolve(safeInfo);
      }

      const timeoutForConnect = setTimeout(() => {
        logger.error("Safe SDK never fired - timeout");
        reject();
      }, 5000);
      newInstance.addListeners({
        onSafeInfo: (safeInfo) => {
          clearTimeout(timeoutForConnect);
          setSafeInfo(safeInfo);
          logger.log(`Safe connection established`, safeInfo);
          resolve(safeInfo);
        },
      });
    });

    return newSafeInfo;
  }, [setSdk, safeInfo]);

  const handleInitWeb3 = useCallback(
    async (newSafeInfo) => {
      const newInstance = await initWeb3(newSafeInfo.network);
      setInstance(newInstance);
    },
    [setInstance]
  );

  const handleInit = useCallback(async () => {
    setStatus("LOADING");

    if (window.self === window.top) {
      setStatus("NOT_IN_IFRAME");
      return;
    }

    try {
      const safeInfo = await handleInitSdk();
      await handleInitWeb3(safeInfo);
    } catch (err) {
      console.error(err);
      setInstance(null);
      setSdk(null);
      setStatus("ERROR");
      return;
    }
    setStatus("SUCCESS");
  }, [handleInitSdk, handleInitWeb3]);

  useEffect(() => {
    return () => {
      if (sdk) sdk.removeListeners();
    };
  }, [sdk]);

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
      const [erc20Contract, batchExchangeContract] = await Promise.all([
        handleGetContract("ERC20Detailed", address),
        handleGetDeployed("BatchExchange"),
      ]);

      const [decimals, symbol, name, balance, onGP] = await Promise.all([
        (async () => {
          const decimalsString = await erc20Contract.methods.decimals().call();
          return parseInt(decimalsString, 10);
        })(),
        erc20Contract.methods.symbol().call(),
        erc20Contract.methods.name().call(),
        erc20Contract.methods.balanceOf(safeInfo.safeAddress).call(),
        batchExchangeContract.methods.hasToken(address).call(),
      ]);

      return {
        address,
        decimals,
        symbol,
        name,
        onGP,
        imageUrl: getImageUrl(address),
        balance: new BN(balance),
      };
    },
    [handleGetContract, handleGetDeployed, safeInfo]
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
    if (!instance || !safeInfo?.safeAddress) {
      return;
    }

    async function loadErc20Details() {
      let safeTokens = {};
      // get all tokens from safe
      try {
        safeTokens = (await getBalances(safeInfo.network, safeInfo.safeAddress))
          .filter(
            // exclude entry without tokenAddress, which corresponds to ETH
            (token) => !!token.tokenAddress
          )
          .reduce(
            // transform it to erc20Details format
            (acc, safeTokenDetails) => ({
              ...acc,
              [safeTokenDetails.tokenAddress]: {
                ...safeTokenDetails.token,
                imageUrl: safeTokenDetails.token.logoUri,
                address: safeTokenDetails.tokenAddress,
                balance: new BN(safeTokenDetails.balance),
              },
            }),
            {}
          );
      } catch (e) {
        logger.error(
          `Failed to fetch tokens from Safe '${safeInfo.safeAddress}'`,
          e
        );
      }
      logger.log("==> Safe tokens", safeTokens);

      // get standard list of tokens to load
      const tokenAddresses = await getTokenAddressesForNetwork(
        await instance.eth.net.getId()
      );

      const erc20Details = await Promise.all(
        tokenAddresses
          // except for tokens already present on the safe
          .filter((address) => !safeTokens[address])
          // fetch erc20 details
          .map(handleGetErc20Details)
      );
      logger.log("==> Additional tokens", erc20Details);

      // exclude tokens from Safe that have not been added to GP contract
      const batchExchangeContract = await handleGetDeployed("BatchExchange");
      (
        await Promise.all(
          Object.keys(safeTokens).map(async (address) => [
            address,
            await batchExchangeContract.methods.hasToken(address).call(),
          ])
        )
      ).forEach(([address, onGP]) => {
        if (!onGP) {
          logger.warn(
            `Token address '${address}' from Safe not registered on GP`
          );
          delete safeTokens[address];
        }
      });

      setErc20Cache(
        erc20Details.reduce((acc, tokenDetails) => {
          if (!tokenDetails.onGP) {
            // exclude tokens from hardcoded list that have not been added to GP contract
            logger.warn(
              `Token address '${tokenDetails.address}' not registered on GP`
            );
            return acc;
          }
          return {
            ...acc,
            [tokenDetails.address]: tokenDetails,
          };
        }, safeTokens)
      );
    }

    loadErc20Details();
  }, [handleGetDeployed, handleGetErc20Details, instance, safeInfo]);

  const handleUpdateBalances = useCallback(async () => {
    if (!safeInfo?.safeAddress) {
      return;
    }

    logger.log("---> Updating balances");

    const updatedBalances = await Promise.all(
      Object.keys(erc20Cache).map(async (address) => {
        const contract = await handleGetContract("ERC20Detailed", address);
        const balance = await contract.methods
          .balanceOf(safeInfo.safeAddress)
          .call();
        const token = erc20Cache[address];
        token.balance = new BN(balance);

        return token;
      }, {})
    );

    setErc20Cache(
      updatedBalances.reduce((tokens, token) => {
        tokens[token.address] = token;
        return tokens;
      }, {})
    );
  }, [erc20Cache, handleGetContract, safeInfo]);

  useEffect(() => {
    // Poor's man background token balance updates
    // TODO: do it once a new block in mined instead, this is not nice.
    const interval = setInterval(handleUpdateBalances, 30000);

    return () => clearInterval(interval);
  }, [handleUpdateBalances]);

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

  if (status === "NOT_IN_IFRAME") {
    return (
      <p>
        App not loaded in Safe. Add this app to your Gnosis Safe on{" "}
        <a href="https://rinkeby.gnosis-safe.io/" rel="noopener noref">
          Rinkeby
        </a>
        ,{" "}
        <a href="https://gnosis-safe.io/" rel="noopener noref">
          Mainnet
        </a>{" "}
        or others
      </p>
    );
  }

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
