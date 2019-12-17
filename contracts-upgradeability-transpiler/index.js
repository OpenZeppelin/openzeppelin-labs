const fs = require("fs");

const {
  getSourceIndices,
  getContract,
  getConstructor
} = require("./src/ast-utils");

const { transpile } = require("./src/transpiler");
const {
  transformConstructor,
  transformContractName
} = require("./src/transformations");

function extractNodeSource(source, node) {
  const [sourceStart, sourceLen] = getSourceIndices(node);
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

  const source = contractData.source;

  const contractNode = getContract(contractData.ast, contractName);
  const constructorNode = getConstructor(contractNode);

  const newSourceCode = constructorToInitializer(source, constructorNode);

  const contractWithInitializer = renameContract(
    newSourceCode,
    contractName,
    contractData.ast,
    "Upgradable"
  );

  const finalCode = transpile(source, [
    transformConstructor(constructorNode, source),
    transformContractName(contractNode, source, `${contractName}Upgradable`)
  ]);
  console.log(finalCode);

  fs.writeFileSync(
    `./contracts/${contractName}Upgradable.sol`,
    contractWithInitializer
  );
}

transpileConstructor("GLDToken");
transpileConstructor("Simple");
