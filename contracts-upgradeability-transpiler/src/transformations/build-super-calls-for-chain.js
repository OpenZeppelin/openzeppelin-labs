const {
  getNodeSources,
  getConstructor,
  getContract,
  idModifierInvocation
} = require("../ast-utils");

const { getInheritanceChain } = require("../get-inheritance-chain");

function buildSuperCall(args, name, source) {
  let superCall = `\n            ${name}Upgradable.__init(false`;
  if (args && args.length) {
    superCall += args.reduce((acc, arg, i) => {
      const [, , argSource] = getNodeSources(arg, source);
      return acc + `, ${argSource}`;
    }, "");
  }
  return superCall + ");";
}

function buildSuperCalls(
  node,
  source,
  contracts,
  mods,
  contractsToArtifactsMap
) {
  const hasInheritance = node.baseContracts.length;
  if (hasInheritance) {
    return [
      ...node.baseContracts
        .filter(base =>
          contracts.some(contract => base.baseName.name === contract)
        )
        .map(base => {
          const mod = mods.filter(
            mod => mod.modifierName.name === base.baseName.name
          )[0];
          if (mod) {
            return buildSuperCall(mod.arguments, mod.modifierName.name, source);
          } else {
            const contractName = base.baseName.name;
            const node = getContract(
              contractsToArtifactsMap[contractName].ast,
              contractName
            );
            const constructorNode = getConstructor(node);

            return (constructorNode &&
              !constructorNode.parameters.parameters.length) ||
              (base.arguments && base.arguments.length)
              ? buildSuperCall(base.arguments, contractName, source)
              : [];
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
  const chain = getInheritanceChain(contractNode.name, contractsToArtifactsMap);
  const mods = chain
    .map(base => {
      const node = getContract(contractsToArtifactsMap[base].ast, base);
      const constructorNode = getConstructor(node);
      return constructorNode
        ? constructorNode.modifiers.filter(mod => idModifierInvocation(mod))
        : [];
    })
    .flat();

  return [
    ...new Set(
      chain
        .map(base => {
          const calls = buildSuperCalls(
            getContract(contractsToArtifactsMap[base].ast, base),
            source,
            contracts,
            mods,
            contractsToArtifactsMap
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
