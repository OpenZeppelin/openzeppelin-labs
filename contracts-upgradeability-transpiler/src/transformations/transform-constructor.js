const {
  getVarDeclarations,
  getNodeSources,
  getConstructor
} = require("../ast-utils");

const { buildSuperCallsForChain } = require("./build-super-calls-for-chain");

function getVarInits(contractNode, source) {
  const varDeclarations = getVarDeclarations(contractNode);
  return varDeclarations
    .filter(vr => vr.value && !vr.constant)
    .map(vr => {
      const [start, len, varSource] = getNodeSources(vr, source);

      const match = /(.*)(=.*)/.exec(varSource);
      if (!match) throw new Error(`Can't find = in ${varSource}`);
      return `\n        ${vr.name} ${match[2]};`;
    })
    .join("");
}

function transformConstructor(
  contractNode,
  source,
  contracts,
  contractsToArtifactsMap
) {
  const superCalls = buildSuperCallsForChain(
    contractNode,
    source,
    contracts,
    contractsToArtifactsMap
  );

  const declarationInserts = getVarInits(contractNode, source);

  const constructorNode = getConstructor(contractNode);

  const isFullyImplemented = contractNode.isFullyImplemented;

  let removeConstructor = null;
  let constructorBodySource = null;
  let constructorParameterList = null;
  let constructorArgsList = null;
  if (constructorNode) {
    constructorBodySource = getNodeSources(constructorNode.body, source)[2]
      .slice(1)
      .slice(0, -1);

    constructorParameterList = getNodeSources(
      constructorNode.parameters,
      source
    )[2]
      .slice(1)
      .slice(0, -1);

    const [start, len] = getNodeSources(constructorNode, source);

    removeConstructor = {
      start: start,
      end: start + len,
      text: ""
    };

    constructorArgsList = constructorNode.parameters.parameters
      .map(par => par.name)
      .join(",");
  }

  constructorParameterList = constructorParameterList
    ? constructorParameterList
    : "";
  const constructorParameterListWithComma = constructorParameterList
    ? `, ${constructorParameterList}`
    : "";
  constructorBodySource = constructorBodySource ? constructorBodySource : "";
  constructorArgsList = constructorArgsList ? `, ${constructorArgsList}` : "";

  const initializeFuncText = `
    function initialize(${constructorParameterList}) external initializer {
        __init(true${constructorArgsList});
    }`;

  const superCallsBlock = superCalls
    ? `if(callChain) {${superCalls}
        }`
    : "";

  const [start, len, contractSource] = getNodeSources(contractNode, source);

  const match = /\bcontract[^\{]*{/.exec(contractSource);
  if (!match)
    throw new Error(`Can't find contract pattern in ${constructorSource}`);

  return [
    removeConstructor,
    {
      start: start + match[0].length,
      end: start + match[0].length,
      text: `${initializeFuncText}\n
    function __init(bool callChain${constructorParameterListWithComma}) internal {
        ${superCallsBlock}
        ${declarationInserts}
        ${constructorBodySource}
    }\n`
    }
  ].filter(tran => tran !== null);
}

module.exports = {
  transformConstructor
};
