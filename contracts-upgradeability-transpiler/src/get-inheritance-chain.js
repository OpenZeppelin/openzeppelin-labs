const { getContract, getConstructor } = require("./ast-utils");

function getInheritanceChain(contract, contractsToArtifactsMap) {
  const helper = contract => {
    const art = contractsToArtifactsMap[contract];
    const contractNode = getContract(art.ast, contract);
    return contractNode.baseContracts.map(base => base.baseName.name);
  };
  const parents = helper(contract);
  return [...parents, ...parents.map(contract => helper(contract)).flat()];
}

module.exports = {
  getInheritanceChain
};
