import TruffleContract from "@truffle/contract";
import getLogger from "utils/logger";

const logger = getLogger("fake-artifact");

/** This util emulates `artifacts` from truffle-contract so that it can be mocked for
 * integrating external libraries that use artifacts.require.
 */

const loadArtifact = (context) => (dirtyContractName) => {
  const contractNameParts = dirtyContractName.split(".");
  if (contractNameParts.length > 1) contractNameParts.pop();
  const contractName = contractNameParts.join("");
  logger.log(`Loading fake-artifact for artifacts.require: [${contractName}]`);

  const artifact = context.getCachedArtifact(contractName);
  const contract = TruffleContract(artifact);
  contract.setProvider(context.web3Instance.currentProvider);

  return contract;
};

const makeArtifactLoader = (context) => {
  return {
    require: loadArtifact(context),
  };
};

export default makeArtifactLoader;
