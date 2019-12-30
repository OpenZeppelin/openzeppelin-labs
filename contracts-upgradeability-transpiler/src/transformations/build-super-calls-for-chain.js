const {
  getNodeSources,
  getConstructor,
  getContract,
  idModifierInvocation
} = require("../ast-utils");

const { getInheritanceChain } = require("../get-inheritance-chain");

function buildSuperCall(args, name, source) {
  let superCall = `\n${name}Upgradable.__init(false`;
  if (args && args.length) {
    superCall += args.reduce((acc, arg, i) => {
      const [, , argSource] = getNodeSources(arg, source);
      return acc + `, ${argSource}`;
    }, "");
  }
  return superCall + ");";
}

function buildSuperCalls(node, source, contracts) {
  const hasInheritance = node.baseContracts.length;
  if (hasInheritance) {
    let superCalls = [];

    const constructorNode = getConstructor(node);
    const mods = constructorNode
      ? constructorNode.modifiers.filter(mod => idModifierInvocation(mod))
      : [];

    return [
      ...superCalls,
      ...node.baseContracts
        .filter(base =>
          contracts.some(contract => base.baseName.name === contract)
        )
        .map(base => {
          const mod = mods.some(
            mod => mod.modifierName.name === base.baseName.name
          )[0];
          if (mod) {
            return buildSuperCall(mod.arguments, mod.modifierName.name, source);
          } else {
            return buildSuperCall(base.arguments, base.baseName.name, source);
          }
        })
    ];
  } else {
    return [];
  }
}

function buildSuperCallsForChain(
  contractNode,
  source,
  contracts,
  contractsToArtifactsMap
) {
  return [
    ...new Set(
      getInheritanceChain(contractNode.name, contractsToArtifactsMap)
        .map(base => {
          const calls = buildSuperCalls(
            getContract(contractsToArtifactsMap[base].ast, base),
            source,
            contracts
          );
          return calls.reverse();
        })
        .flat()
    )
  ]
    .reverse()
    .join("");
}

module.exports = { buildSuperCallsForChain };
