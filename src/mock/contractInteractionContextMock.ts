import {
  StatusEnum,
  ContractInteractionContextProps,
} from "components/context/ContractInteractionProvider";
import { SafeInfo } from "@gnosis.pm/safe-apps-sdk";
import { fromPairs } from "lodash";
import { TokenDetails } from "types";
const defaultSafeInfo = {
  safeAddress: "0x123456",
} as SafeInfo;

const globalArtifactCache = {};

interface ContractStateMock {
  transactionHash: string;
  blockNumber: number;
  methodMocks: Record<string, any>;
  variableMocks: Record<string, any>;
  eventMocks: Record<string, any>;
}

interface ContractMockSettings {
  status?: StatusEnum;
  safeInfo?: SafeInfo;
}

export class ContractContextMock implements ContractInteractionContextProps {
  status: StatusEnum = "SUCCESS";
  safeInfo: SafeInfo = defaultSafeInfo;

  web3Instance: Record<string, any>;

  // contractName: {
  //   contractAddress: {
  //      myMethodName(number, mumber): value
  contractMethodMocks: Record<string, Record<string, Record<string, any>>>;

  // contractName: {
  //   contractAddress: {
  //     myEventName: [
  //       Event,
  //       Event,
  //     }
  contractEventMocks: Record<
    string,
    Record<string, Record<string, Record<string, any>[]>>
  >;

  constructor(contractMockSettings: ContractMockSettings = {}) {
    if (contractMockSettings.status) this.status = contractMockSettings.status;
    if (contractMockSettings.safeInfo)
      this.safeInfo = contractMockSettings.safeInfo;

    const eth: Record<string, any> = {
      getBlock: this.getBlock,
    };

    this.web3Instance = {
      eth,
    };
  }

  getBlock(blockHashOrBlockNumber: string | number): Record<string, any> {
    return {
      number: 123,
      timestamp: Math.round(new Date("01/01/2020 12:00:00").valueOf() / 1000), // Timestamp returned in seconds
    };
  }

  mockContractMethodReturn(
    contractName: string,
    methodName: string,
    returnValues: Record<string, any> | any,
    contractAddress = "DEPLOYED"
  ): void {
    if (!this.contractMethodMocks) {
      this.contractMethodMocks = {};
    }

    if (!this.contractMethodMocks[contractName]) {
      this.contractMethodMocks[contractName] = {};
    }

    if (!this.contractMethodMocks[contractName][contractAddress]) {
      this.contractMethodMocks[contractName][contractAddress] = {};
    }

    let method = (...params) => {
      console.log(`${methodName} called with ${params.join(", ")}`);
      return {
        call: () => returnValues,
        send: () => returnValues,
      };
    };

    if (typeof returnValues === "function") {
      method = (...params) => {
        console.log(`${methodName} called with ${params.join(", ")}`);
        return {
          call: () => returnValues(...params),
          send: () => returnValues(...params),
        };
      };
    }

    this.contractMethodMocks[contractName][contractAddress][
      methodName
    ] = method;
  }

  hasMockContractMethodReturn(
    contractName: string,
    methodName: string,
    contractAddress = "DEPLOYED"
  ): boolean {
    if (!this.contractMethodMocks) {
      return false;
    }

    if (!this.contractMethodMocks[contractName]) {
      return false;
    }

    if (!this.contractMethodMocks[contractName][contractAddress]) {
      return false;
    }

    return (
      this.contractMethodMocks[contractName][contractAddress][methodName] !=
      null
    );
  }

  mockContractEventEmit(
    contractName: string,
    eventName: string,
    eventData: Record<string, any>,
    contractAddress = "DEPLOYED"
  ): void {
    if (!this.contractEventMocks) {
      this.contractEventMocks = {};
    }

    if (!this.contractEventMocks[contractName]) {
      this.contractEventMocks[contractName] = {};
    }

    if (!this.contractEventMocks[contractName][contractAddress]) {
      this.contractEventMocks[contractName][contractAddress] = {};
    }

    if (!this.contractEventMocks[contractName][contractAddress][eventName]) {
      this.contractEventMocks[contractName][contractAddress][eventName] = [];
    }

    this.contractEventMocks[contractName][contractAddress][eventName].push({
      returnValues: eventData,
    });
  }

  hasMockContractEventEmit(
    contractName: string,
    eventName: string,
    contractAddress = "DEPLOYED"
  ): boolean {
    if (!this.contractEventMocks) {
      return false;
    }

    if (!this.contractEventMocks[contractName]) {
      return false;
    }

    if (!this.contractEventMocks[contractName][contractAddress]) {
      return false;
    }

    if (!this.contractEventMocks[contractName][contractAddress][eventName]) {
      return false;
    }

    return (
      this.contractEventMocks[contractName][contractAddress][eventName].length >
      0
    );
  }

  /**
   * Automatically "fill" all methods and events with some default return/event
   *
   * @param contractName
   * @param contractArtifact
   */
  autoMock(contractName: string, contractArtifact: any): void {
    contractArtifact.abi.forEach((abiDefinition) => {
      if (
        abiDefinition.type === "function" &&
        !this.hasMockContractMethodReturn(contractName, abiDefinition.name)
      ) {
        this.mockContractMethodReturn(
          contractName,
          abiDefinition.name,
          "AUTO MOCKED"
        );
      }
      if (
        abiDefinition.type === "event" &&
        !this.hasMockContractEventEmit(contractName, abiDefinition.name)
      ) {
        this.mockContractEventEmit(
          contractName,
          abiDefinition.name,
          fromPairs(
            abiDefinition.inputs.map((eventInput: Record<string, any>) => [
              eventInput.name,
              "AUTO MOCKED",
            ])
          )
        );
      }
    });
  }

  getArtifact(contractName: string): Promise<any> {
    if (!globalArtifactCache[contractName]) {
      globalArtifactCache[
        contractName
      ] = require(`../../build/contracts/${contractName}.json`);

      this.autoMock(contractName, globalArtifactCache[contractName]);
    }
    return globalArtifactCache[contractName];
  }

  getContract(contractName: string, contractAddress: string): Promise<any> {
    this.getArtifact(contractName); // Will automatically mock some functions

    return Promise.resolve({
      methods:
        this.contractMethodMocks &&
        this.contractMethodMocks[contractName] &&
        this.contractMethodMocks[contractName][contractAddress]
          ? this.contractMethodMocks[contractName][contractAddress]
          : {},
      getPastEvents: (eventName) => {
        return Promise.resolve(
          this.contractEventMocks[contractName][contractAddress][eventName]
        );
      },
    });
  }

  getDeployed(contractName: string): Promise<any> {
    return this.getContract(contractName, "DEPLOYED");
  }

  getErc20Details(tokenAddress: string): Promise<TokenDetails> {
    const returnValue: TokenDetails = {
      symbol: "TEST",
      name: "Test Token",
      decimals: 18,
      address: tokenAddress,
      onGP: true,
    };

    return Promise.resolve(returnValue);
  }
}
