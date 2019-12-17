const fs = require("fs");
const find = require("lodash.find");

const { getNode } = require("./src/ast-utils");

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

function renameContract(sourceCode, contractName, nodes, appendToName) {
  const contractNode = find(nodes, ["name", contractName]);
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

  const contractNode = find(contractData.ast.nodes, ["name", contractName]);
  const constructorNode = find(contractNode.nodes, ["kind", "constructor"]);

  const contractWithInitializer = renameContract(
    constructorToInitializer(contractData.source, constructorNode),
    contractName,
    contractData.ast.nodes,
    "Upgradable"
  );

  fs.writeFileSync(
    `./contracts/${contractName}Upgradable.sol`,
    contractWithInitializer
  );
}

transpileConstructor("GLDToken");
transpileConstructor("Simple");
