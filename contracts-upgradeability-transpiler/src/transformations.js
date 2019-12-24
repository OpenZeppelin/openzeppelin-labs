const {
  getImportDirectives,
  getPragmaDirectives,
  getVarDeclarations,
  getNodeSources,
  getSourceIndices,
  getConstructor,
  getContracts,
  getContract,
  idModifierInvocation
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

function buildSuperCalls(contractNode, source, contracts) {
  function buildSuperCall(args, name) {
    let superCall = `\n${name}Upgradable.initialize(`;
    if (args && args.length) {
      superCall += args.reduce((acc, arg, i) => {
        const [, , argSource] = getNodeSources(arg, source);
        return acc + argSource + (i !== args.length - 1 ? "," : "");
      }, "");
    }
    return superCall + ");";
  }

  const hasInheritance = contractNode.baseContracts.length;
  if (hasInheritance) {
    let superCalls = [];

    const constructorSuperCalls = {};

    const constructorNode = getConstructor(contractNode);
    if (constructorNode && constructorNode.modifiers) {
      const mods = constructorNode.modifiers.filter(mod =>
        idModifierInvocation(mod)
      );
      if (mods.length) {
        superCalls = [
          ...superCalls,
          ...mods.map(mod => {
            constructorSuperCalls[mod.modifierName.name] = true;
            return buildSuperCall(mod.arguments, mod.modifierName.name);
          })
        ];
      }
    }

    superCalls = [
      ...superCalls,
      ...contractNode.baseContracts
        .filter(
          base =>
            !constructorSuperCalls[base.baseName.name] &&
            contracts.some(contract => base.baseName.name === contract)
        )
        .map(base => buildSuperCall(base.arguments, base.baseName.name))
    ];

    return superCalls.join("");
  } else {
    return "";
  }
}

function getVarInits(contractNode, source) {
  const varDeclarations = getVarDeclarations(contractNode);
  return varDeclarations
    .filter(vr => vr.value && !vr.constant)
    .map(vr => {
      const [start, len, varSource] = getNodeSources(vr, source);

      const match = /(.*)(=.*)/.exec(varSource);
      if (!match) throw new Error(`Can't find = in ${varSource}`);
      return `\n${vr.name} ${match[2]};`;
    })
    .join("");
}

function purgeBaseConstructorCalls(constructorNode, source) {
  if (constructorNode && constructorNode.modifiers) {
    const mods = constructorNode.modifiers.filter(mod =>
      idModifierInvocation(mod)
    );
    return mods.map(mod => {
      const [start, len, modSource] = getNodeSources(mod, source);
      return {
        start,
        end: start + len,
        text: ""
      };
    });
  }
}

function transformConstructor(contractNode, source, contracts) {
  const superCalls = buildSuperCalls(contractNode, source, contracts);

  const declarationInserts = getVarInits(contractNode, source);

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

    const matchInternal = /\binternal/.exec(constructorSource);

    return [
      {
        start: start + match.index,
        end: start + match.index + "constructor".length,
        text
      },
      matchInternal
        ? {
            start: start + matchInternal.index,
            end: start + matchInternal.index + matchInternal[0].length,
            text: "public"
          }
        : null,
      {
        start: start + match[0].length,
        end: start + match[0].length,
        text: `initializer `
      },
      {
        start: constructorStart + 1,
        end: constructorStart + 1,
        text: superCalls
      },
      {
        start: constructorStart + 1,
        end: constructorStart + 1,
        text: declarationInserts
      },
      ...purgeBaseConstructorCalls(constructorNode, source)
    ].filter(tran => tran !== null);
  } else {
    const [start, len, contractSource] = getNodeSources(contractNode, source);

    const match = /\bcontract[^\{]*{/.exec(contractSource);
    if (!match)
      throw new Error(`Can't find contract pattern in ${constructorSource}`);

    return [
      {
        start: start + match[0].length,
        end: start + match[0].length,
        text: `\nfunction initialize() public initializer {
          ${superCalls}
          ${declarationInserts}
        }`
      }
    ];
  }
}

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

function fixImportDirectives(artifact, artifacts, contracts) {
  const imports = getImportDirectives(artifact.ast);
  return imports.map(imp => {
    const [start, len] = getSourceIndices(imp);
    const isTranspiled = artifacts.some(
      art =>
        art.ast.id === imp.sourceUnit &&
        contracts.some(contract => contract === art.contractName)
    );
    const prefix = !imp.file.startsWith(".") ? "./" : "";
    let fixedPath = `import "${prefix}${imp.file.replace(
      ".sol",
      "Upgradable.sol"
    )}";`;
    return {
      start,
      end: start + len,
      text: !isTranspiled ? `import "${imp.absolutePath}";` : fixedPath
    };
  });
}

module.exports = {
  transformConstructor,
  transformContractName,
  appendDirective,
  prependBaseClass,
  purgeContracts,
  transformParents,
  fixImportDirectives
};
