const { getSourceIndices, getContracts } = require("../ast-utils");

function purgeContracts(astNode, contracts) {
  const toPurge = getContracts(astNode).filter(node =>
    contracts.every(c => node.name !== c)
  );
  return toPurge.map(contractNode => {
    const [start, len] = getSourceIndices(contractNode);

    return {
      start,
      end: start + len,
      text: ""
    };
  });
}

module.exports = { purgeContracts };
