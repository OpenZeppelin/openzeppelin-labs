const fs = require('fs');
const { execSync } = require('child_process');
const _ = require('lodash');
const process = require('process');

function getSrcIndices(node) {
  return node.src.split(':').map(_.unary(parseInt)).slice(0, 2);
}

function extractNodeSource(source, node) {
  const [sourceStart, sourceLen] = getSrcIndices(node);
  return source.slice(sourceStart, sourceStart + sourceLen);
}

function getConstructorNode(contractName, contractData) {
  const contractNode = _.find(contractData.ast.nodes, ['name', contractName]);
  const constructorNode = _.find(contractNode.nodes, 'isConstructor');
  return constructorNode;
}

function constructorToInitializer(contractData, constructorNode) {
  const sourceCode = contractData.source;  
  const constructorSource = extractNodeSource(sourceCode, constructorNode)
  const initializerSource = constructorSource.replace(/\s*constructor/, 'function initializer');
  return sourceCode.replace(constructorSource, initializerSource);
}

function removeConstructor(contractData, constructorNode) {
  const sourceCode = contractData.source;
  const [sourceStart, sourceLen] = getSrcIndices(constructorNode);
  return sourceCode.slice(0, sourceStart) + sourceCode.slice(sourceStart + sourceLen, sourceCode.length);
}

function renameContract(sourceCode, contractName, contractData, appendToName) {
  const contractNode = _.find(contractData.ast.nodes, ['name', contractName]);
  const contractSource = extractNodeSource(sourceCode, contractNode);
  const renamedContractSource = contractSource.replace(contractName, `${contractName}_${appendToName}`)
  return sourceCode.replace(contractSource, renamedContractSource);
}

function generateZosContractsFor(contractName) {
  const contractData = JSON.parse(fs.readFileSync(`./build/contracts/${contractName}.json`));
  const constructorNode = getConstructorNode(contractName, contractData);  
  const contractWithInitializer = renameContract(constructorToInitializer(contractData, constructorNode), contractName, contractData, 'initializer');
  const contractWithoutConstructor = renameContract(removeConstructor(contractData, constructorNode), contractName, contractData, 'implementation');

  fs.writeFileSync(`./contracts/${contractName}_initializer.sol`, contractWithInitializer);
  fs.writeFileSync(`./contracts/${contractName}_implementation.sol`, contractWithoutConstructor);
}

function compile() {
  execSync('npm run compile');
}

function main(contractName) {
  console.log("Processing", contractName);
  generateZosContractsFor(contractName);
}

main(process.argv[2]);