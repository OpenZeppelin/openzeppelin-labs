const {
  getImportDirectives,
  getPragmaDirectives,
  getNodeSources,
  getSourceIndices
} = require("./ast-utils");

function insertDirective(node, directive) {
  const retVal = {
    start: 0,
    end: 0,
    text: directive
  };
  const importsAndPragmas = [
    ...getPragmaDirectives(node),
    ...getImportDirectives(node)
  ];
  if (importsAndPragmas.length) {
    const last = importsAndPragmas.slice(-1)[0];
    const [start, len] = getSourceIndices(last);
    retVal.start = start + len;
    retVal.end = start + len;
  }

  return retVal;
}

function transformContractName(contractNode, source, newName) {
  const [start, len, nodeSource] = getNodeSources(contractNode, source);

  const subStart = nodeSource.indexOf(contractNode.name);
  if (subStart === -1)
    throw new Error(`Can't find ${contractNode.name} in ${nodeSource}`);

  return {
    start: start + subStart,
    end: start + subStart + contractNode.name.length,
    text: newName
  };
}

function transformConstructor(constructorNode, source) {
  const text = "function initialize";

  const [start, len, nodeSource] = getNodeSources(constructorNode, source);

  var match = /\bconstructor/.exec(nodeSource);
  if (!match)
    throw new Error(`Can't find ${contractNode.name} in ${nodeSource}`);

  return {
    start: start + match.index,
    end: start + match.index + "constructor".length,
    text
  };
}

module.exports = {
  transformConstructor,
  transformContractName,
  insertDirective
};
