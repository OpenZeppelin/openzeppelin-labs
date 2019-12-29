const { getContract, getContractById, getConstructor } = require("./ast-utils");

function getInheritanceChain(contract, contractsToArtifactsMap) {
  const art = contractsToArtifactsMap[contract];
  const contractNode = getContract(art.ast, contract);

  return contractNode.linearizedBaseContracts.map(base => {
    return contractsToArtifactsMap[base].contractName;
  });
}

module.exports = {
  getInheritanceChain
};
