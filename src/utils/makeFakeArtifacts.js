import TruffleContract from "@truffle/contract";
console.log(TruffleContract);

/** This util emulates `artifacts` from truffle-contract so that it can be mocked for
 * integrating external libraries that use artifacts.require.
 */

const loadArtifact = (context) => (dirtyContractName) => {
  const contractNameParts = dirtyContractName.split(".");
  if (contractNameParts.length > 1) contractNameParts.pop();
  const contractName = contractNameParts.join("");
  console.log(`artifacts.require: [${contractName}]`);

  const artifact = context.getCachedArtifact(contractName);
  const contract = TruffleContract(artifact);
  contract.setProvider(context.instance.currentProvider);
  console.log(contractName, contract);

  return contract;
};

const makeArtifactLoader = (context) => {
  return {
    require: loadArtifact(context),
  };
};

export default makeArtifactLoader;
