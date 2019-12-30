const { getNodeSources } = require("../ast-utils");

function transformParents(contractNode, source, contracts) {
  const hasInheritance = contractNode.baseContracts.length;

  if (hasInheritance) {
    return contractNode.baseContracts
      .filter(base =>
        contracts.some(contract => base.baseName.name === contract)
      )
      .map(base => {
        const [start, , baseSource] = getNodeSources(base.baseName, source);
        const [, len] = getNodeSources(base, source);

        return {
          start: start,
          end: start + len,
          text: `${baseSource}Upgradable`
        };
      });
  } else return [];
}

module.exports = { transformParents };
