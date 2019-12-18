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

function insertBaseClass(node, source, cls) {
  const hasInheritance = node.baseContracts.length;

  const [start, len, nodeSource] = getNodeSources(node, source);

  const regExp = RegExp(`\\bcontract\\s+${node.name}(\\s+is)?`);

  var match = regExp.exec(nodeSource);
  if (!match)
    throw new Error(`Can't find ${contractNode.name} in ${nodeSource}`);

  return {
    start: start + match.index + match[0].length,
    end: start + match.index + match[0].length,
    text: hasInheritance ? ` ${cls},` : ` is ${cls}`
  };
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
  insertDirective,
  insertBaseClass
};
