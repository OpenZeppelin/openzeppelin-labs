const fs = require("fs");

const { getNode, getContract, getConstructor } = require("./src/ast-utils");

function getSrcIndices(node) {
  return node.src
    .split(":")
    .map(val => parseInt(val))
    .slice(0, 2);
}

function extractNodeSource(source, node) {
  const [sourceStart, sourceLen] = getSrcIndices(node);
  return source.slice(sourceStart, sourceStart + sourceLen);
}

function constructorToInitializer(sourceCode, constructorNode) {
  const constructorSource = extractNodeSource(sourceCode, constructorNode);
  const initializerSource = constructorSource.replace(
    /\bconstructor/,
    "function initialize"
  );
  return sourceCode.replace(constructorSource, initializerSource);
}

function renameContract(sourceCode, contractName, node, appendToName) {
  const contractNode = getContract(node, contractName);
  const contractSource = extractNodeSource(sourceCode, contractNode);
  const renamedContractSource = contractSource.replace(
    contractName,
    `${contractName}${appendToName}`
  );
  return sourceCode.replace(contractSource, renamedContractSource);
}

function transpileConstructor(contractName) {
  const contractData = JSON.parse(
    fs.readFileSync(`./build/contracts/${contractName}.json`)
  );

  const contractNode = getContract(contractData.ast, contractName);
  const constructorNode = getConstructor(contractNode);

  const newSourceCode = constructorToInitializer(
    contractData.source,
    constructorNode
  );

  const contractWithInitializer = renameContract(
    newSourceCode,
    contractName,
    contractData.ast,
    "Upgradable"
  );

  fs.writeFileSync(
    `./contracts/${contractName}Upgradable.sol`,
    contractWithInitializer
  );
}

transpileConstructor("GLDToken");
transpileConstructor("Simple");
