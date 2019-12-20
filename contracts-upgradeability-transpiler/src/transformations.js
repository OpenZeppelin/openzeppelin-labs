const {
  getImportDirectives,
  getPragmaDirectives,
  getVarDeclarations,
  getNodeSources,
  getSourceIndices,
  getConstructor
} = require("./ast-utils");

function appendDirective(fileNode, directive) {
  const retVal = {
    start: 0,
    end: 0,
    text: directive
  };
  const importsAndPragmas = [
    ...getPragmaDirectives(fileNode),
    ...getImportDirectives(fileNode)
  ];
  if (importsAndPragmas.length) {
    const last = importsAndPragmas.slice(-1)[0];
    const [start, len] = getSourceIndices(last);
    retVal.start = start + len;
    retVal.end = start + len;
  }

  return retVal;
}

function prependBaseClass(contractNode, source, cls) {
  const hasInheritance = contractNode.baseContracts.length;

  const [start, len, nodeSource] = getNodeSources(contractNode, source);

  const regExp = RegExp(`\\bcontract\\s+${contractNode.name}(\\s+is)?`);

  const match = regExp.exec(nodeSource);
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

function transformConstructor(contractNode, source) {
  const varDeclarations = getVarDeclarations(contractNode);
  const declarationInserts = varDeclarations
    .filter(vr => vr.value && !vr.constant)
    .map(vr => {
      const [start, len, varSource] = getNodeSources(vr, source);

      const match = /(.*)(=.*)/.exec(varSource);
      if (!match) throw new Error(`Can't find = in ${varSource}`);
      return `\n${vr.name} ${match[2]};`;
    })
    .join("");

  const constructorNode = getConstructor(contractNode);

  if (constructorNode) {
    const text = "function initialize";

    const [constructorStart, ,] = getNodeSources(constructorNode.body, source);

    const [start, len, constructorSource] = getNodeSources(
      constructorNode,
      source
    );

    const match = /\bconstructor[^{]*/.exec(constructorSource);
    if (!match)
      throw new Error(
        `Can't find ${constructorNode.name} in ${constructorSource}`
      );

    return [
      {
        start: start + match.index,
        end: start + match.index + "constructor".length,
        text
      },
      {
        start: start + match[0].length,
        end: start + match[0].length,
        text: `initializer `
      },
      {
        start: constructorStart + 1,
        end: constructorStart + 1,
        text: declarationInserts
      }
    ];
  } else {
    const [start, len, contractSource] = getNodeSources(contractNode, source);

    const match = /\bcontract[^\{]*{/.exec(contractSource);
    if (!match)
      throw new Error(`Can't find contract pattern in ${constructorSource}`);

    return [
      {
        start: start + match[0].length,
        end: start + match[0].length,
        text: `\nfunction initialize() public initializer { ${declarationInserts} }`
      }
    ];
  }
}

module.exports = {
  transformConstructor,
  transformContractName,
  appendDirective,
  prependBaseClass
};
