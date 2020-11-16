import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

import { SafeInfo, SdkInstance } from "@gnosis.pm/safe-apps-sdk";
import fromPairs from "lodash/fromPairs";

import initSdk from "@gnosis.pm/safe-apps-sdk";
import getLogger from "utils/logger";
import initWeb3 from "utils/initWeb3";
import { Loader } from "@gnosis.pm/safe-react-components";
import { TokenDetails } from "types";
import BN from "bn.js";

import { getImageUrl } from "utils/misc";

import { getTokenAddressesForNetwork } from "api/tokenAddresses";
import { getBalances } from "api/safe";
import { tokenBalancesState, tokenDetailsState } from "state/atoms";

const logger = getLogger("contract-interaction-provider");

type StatusEnum = "LOADING" | "SUCCESS" | "ERROR" | "NOT_IN_IFRAME";

export interface ContractInteractionContextProps {
  status: StatusEnum;
  sdkInstance?: SdkInstance;
  web3Instance?: any;
  safeInfo?: SafeInfo;
  getArtifact?: (contractName: string) => Promise<any>; // TODO: Typing for Webpack Module
  getCachedArtifact?: (contractName: string) => any; // TODO: Typing for Webpack Module
  getContract?: (contractName: string, address: string) => Promise<any>; // TODO: Typing for web3.eth.Contract
  getDeployed?: (contractName: string) => Promise<any>; // TODO: Typing for web3.eth.Contract
  getErc20Details?: (tokenAddress: string) => Promise<TokenDetails>;
  fetchTokenBalance?: (tokenAddress: string) => Promise<BN>;
}

export interface Props {
  children?: React.ReactNode;
}

export const ContractInteractionContext = createContext<
  ContractInteractionContextProps
>({
  status: "LOADING",
  sdkInstance: null,
  web3Instance: null,
});

const readContractJSON = async (contractName) => {
  const contractArtifact = await import(`contracts/${contractName}.json`);
  return contractArtifact;
};

const globalArtifacts: Record<string, any> = {}; // Cache of artifacts for getCachedArtifact
const globalArtifactPromises: Record<string, Promise<unknown>> = {}; // Cache of promises for getArtifact
const globalDeployedContracts: Record<string, any> = {}; // Cache of Web3 Contracts by NetworkID for getDeployed
const globalContractsByAddress: Record<string, any> = {}; // Cache of Contracts by Address for getContract

export const ContractInteractionProvider = ({
  children,
}: Props): JSX.Element => {
  const [status, setStatus] = useState<StatusEnum>("LOADING");
  const [web3Instance, setWeb3Instance] = useState<any>(null);
  const [sdkInstance, setSdkInstance] = useState<SdkInstance>(null);
  const [safeInfo, setSafeInfo] = useState<SafeInfo>(null);

  const setTokenBalances = useSetRecoilState(tokenBalancesState);

  const [tokenDetails, setTokenDetails] = useRecoilState(tokenDetailsState);

  const handleInitSdk = useCallback(async (): Promise<SafeInfo> => {
    const newInstance = await initSdk();
    setSdkInstance(newInstance);

    const newSafeInfo: SafeInfo = await new Promise((resolve, reject) => {
      if (safeInfo) {
        // this only occours on dev hot-reload
        // addListeners only fires once. if it has fired before,
        // the callback below will never complete :(
        return resolve(safeInfo);
      }

      const timeoutForConnect = setTimeout((): void => {
        logger.error("Safe SDK never fired - timeout");
        reject();
      }, 5000);
      newInstance.addListeners({
        onSafeInfo: (safeInfo): void => {
          clearTimeout(timeoutForConnect);
          setSafeInfo(safeInfo);
          logger.log(`Safe connection established`, safeInfo);
          resolve(safeInfo);
        },
      });
    });

    return newSafeInfo;
  }, [safeInfo]);

  const handleInitWeb3 = useCallback(async (safeInfo: SafeInfo) => {
    const newInstance = await initWeb3(safeInfo.network);
    setWeb3Instance(newInstance);
  }, []);

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
      setWeb3Instance(null);
      setSdkInstance(null);
      setStatus("ERROR");
      return;
    }
    setStatus("SUCCESS");
  }, [handleInitSdk, handleInitWeb3]);

  const handleGetArtifact = useCallback(async (dirtyContractName): Promise<
    any
  > => {
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

  const handleGetCachedArtifact = useCallback((contractName): any => {
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
    async (contractName, contractAddress = null): Promise<any> => {
      const contractArtifact = await handleGetArtifact(contractName);

      if (!globalContractsByAddress[contractName]) {
        globalContractsByAddress[contractName] = {};
      }

      if (!globalContractsByAddress[contractName][contractAddress]) {
        const contractInstance = new web3Instance.eth.Contract(
          contractArtifact.abi,
          contractAddress
        );

        contractInstance.setProvider(web3Instance.currentProvider);

        // FIXME: Bad Monkeypatching
        // Allows us to access the contracts saved artifact later by referencing it by the contractname. Contractnames need to be unique.
        contractInstance.contractName = contractName;

        globalContractsByAddress[contractName][
          contractAddress
        ] = contractInstance;
      }

      return globalContractsByAddress[contractName][contractAddress];
    },
    [handleGetArtifact, web3Instance]
  );

  /**
   * Loads a contract instance with the current networks deployed address
   *
   * @param {string} contractName - Contractname to load the deployed instance for
   * @returns {web3.eth.Contract} - Contractinstance
   */
  const handleGetDeployed = useCallback(
    async (contractName): Promise<any> => {
      const contractArtifact = await handleGetArtifact(contractName);

      const networkId = await web3Instance.eth.net.getId();

      if (!globalDeployedContracts[networkId]) {
        globalDeployedContracts[networkId] = {};
      }

      if (!globalDeployedContracts[networkId][contractName]) {
        const networkDeploymentInfo = contractArtifact.networks[networkId];
        if (!networkDeploymentInfo) {
          throw new Error(
            `'${contractName}' contract not deployed on '${networkId}' network according to build artifacts. Add address or update artifact`
          );
        }
        globalDeployedContracts[networkId][contractName] = handleGetContract(
          contractName,
          networkDeploymentInfo.address
        );
      }
      return globalDeployedContracts[networkId][contractName];
    },
    [handleGetContract, handleGetArtifact, web3Instance]
  );

  /**
   * Fetches erc20 token details from contract
   *
   * @param {string} address - The erc20 token address
   * @returns {object} - Erc20 token details (decimals, name, symbol, address)
   */
  const handleGetErc20Details = useCallback(
    async (address): Promise<TokenDetails> => {
      const [erc20Contract, batchExchangeContract] = await Promise.all([
        handleGetContract("ERC20Detailed", address),
        handleGetDeployed("BatchExchange"),
      ]);

      const [decimals, symbol, name, onGP, id] = await Promise.all([
        (async () => {
          const decimalsString = await erc20Contract.methods.decimals().call();
          return parseInt(decimalsString, 10);
        })(),
        erc20Contract.methods.symbol().call(),
        erc20Contract.methods.name().call(),
        batchExchangeContract.methods.hasToken(address).call(),
        (async (address: string): Promise<number | undefined> => {
          try {
            const id = await batchExchangeContract.methods
              .tokenAddressToIdMap(address)
              .call();
            return +id;
          } catch (e) {
            // When not registered, call might fail
            logger.warn(
              `Failed to get id for token '${address}'. Likely not registered on GP`,
              e.message
            );

            return undefined;
          }
        })(address),
      ]);

      return {
        address,
        decimals,
        symbol,
        name,
        onGP,
        id,
        imageUrl: getImageUrl(address),
      };
    },
    [handleGetContract, handleGetDeployed]
  );

  /**
   * Fetches erc20 token details from local cache if existing or contract if not
   *
   * @param {string} address - The erc20 token address
   * @returns {object} - Erc20 token details (decimals, name, symbol, address)
   */
  const handleGetErc20FromCache = useCallback(
    async (address): Promise<TokenDetails> => {
      if (tokenDetails[address]) {
        return tokenDetails[address];
      }
      const details = await handleGetErc20Details(address);

      setTokenDetails((cache) => ({ ...cache, [address]: details }));

      return details;
    },
    [handleGetErc20Details, setTokenDetails, tokenDetails]
  );

  useEffect(() => {
    if (!web3Instance || !safeInfo?.safeAddress) {
      return;
    }

    async function loadErc20Details() {
      let safeTokens = {};
      // get all tokens from safe

      const batchExchangeContract = await handleGetDeployed("BatchExchange");

      try {
        const balances: Record<string, BN> = {};
        safeTokens = fromPairs(
          await Promise.all(
            (await getBalances(safeInfo.network, safeInfo.safeAddress))
              .filter(
                // exclude entry without tokenAddress, which corresponds to ETH
                (token) => !!token.tokenAddress
              )
              .map(
                // transform it to erc20Details format
                async (safeTokenDetails) => {
                  const hasTokenOnGP = await batchExchangeContract.methods
                    .hasToken(safeTokenDetails.tokenAddress)
                    .call();

                  // only check exchange id if registered on exchange
                  let id: undefined | number;
                  if (hasTokenOnGP) {
                    id = Number(
                      await batchExchangeContract.methods
                        .tokenAddressToIdMap(safeTokenDetails.tokenAddress)
                        .call()
                    );
                  }

                  // side-effect: add to balances records
                  balances[safeTokenDetails.tokenAddress] = new BN(
                    safeTokenDetails.balance
                  );

                  return [
                    safeTokenDetails.tokenAddress,
                    {
                      ...safeTokenDetails.token,
                      imageUrl: safeTokenDetails.token.logoUri,
                      address: safeTokenDetails.tokenAddress,
                      onGP: hasTokenOnGP,
                      id,
                    },
                  ];
                }
              )
          )
        );

        // update balance on recoil
        setTokenBalances((oldBalances) => ({
          ...oldBalances,
          ...balances,
        }));
      } catch (e) {
        logger.error(
          `Failed to fetch tokens from Safe '${safeInfo.safeAddress}'`,
          e
        );
      }
      logger.log("==> Safe tokens", safeTokens);

      // get standard list of tokens to load
      const tokenAddresses = await getTokenAddressesForNetwork(
        await web3Instance.eth.net.getId()
      );

      const erc20Details: TokenDetails[] = await Promise.all(
        tokenAddresses
          // except for tokens already present on the safe
          .filter((address) => !safeTokens[address])
          // fetch erc20 details
          .map(handleGetErc20Details)
      );
      logger.log("==> Additional tokens", erc20Details);

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

      setTokenDetails(
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
  }, [
    handleGetDeployed,
    handleGetErc20Details,
    web3Instance,
    safeInfo,
    setTokenBalances,
    setTokenDetails,
  ]);

  const fetchTokenBalance = useCallback(
    async (address: string): Promise<BN | null> => {
      if (!safeInfo?.safeAddress) {
        return null;
      }
      const contract = await handleGetContract("ERC20Detailed", address);
      const balance = await contract.methods
        .balanceOf(safeInfo.safeAddress)
        .call();
      return new BN(balance);
    },
    [handleGetContract, safeInfo]
  );

  const contextValue = useMemo(
    (): ContractInteractionContextProps => ({
      status,
      web3Instance,
      sdkInstance,
      safeInfo,
      getArtifact: handleGetArtifact,
      getCachedArtifact: handleGetCachedArtifact,
      getDeployed: handleGetDeployed,
      getContract: handleGetContract,
      getErc20Details: handleGetErc20FromCache,
      fetchTokenBalance,
    }),
    [
      status,
      web3Instance,
      sdkInstance,
      safeInfo,
      handleGetArtifact,
      handleGetCachedArtifact,
      handleGetDeployed,
      handleGetContract,
      handleGetErc20FromCache,
      fetchTokenBalance,
    ]
  );

  const handleAsyncInit = useCallback(() => {
    handleInit();
  }, [handleInit]);

  useEffect(() => {
    return () => {
      if (sdkInstance) sdkInstance.removeListeners();
    };
  }, [sdkInstance]);

  useEffect(handleAsyncInit, [handleAsyncInit]);

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

  if (status === "LOADING") {
    return <Loader size="lg" />;
  }

  return (
    <ContractInteractionContext.Provider value={contextValue}>
      {children}
    </ContractInteractionContext.Provider>
  );
};
