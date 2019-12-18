const fs = require("fs");

const { getContract, getConstructor } = require("./src/ast-utils");

const { transpile } = require("./src/transpiler");

const {
  transformConstructor,
  transformContractName,
  appendDirective,
  prependBaseClass
} = require("./src/transformations");

function transpileConstructor(contractName) {
  const contractData = JSON.parse(
    fs.readFileSync(`./build/contracts/${contractName}.json`)
  );

  const source = contractData.source;

  const contractNode = getContract(contractData.ast, contractName);
  const constructorNode = getConstructor(contractNode);

  const directive = `\nimport "@openzeppelin/upgrades/contracts/Initializable.sol";`;

  const finalCode = transpile(source, [
    appendDirective(contractData.ast, directive),
    prependBaseClass(contractNode, source, "Initializable"),
    ...transformConstructor(constructorNode, source),
    transformContractName(contractNode, source, `${contractName}Upgradable`)
  ]);

  fs.writeFileSync(`./contracts/${contractName}Upgradable.sol`, finalCode);
}

transpileConstructor("GLDToken");
transpileConstructor("Simple");
