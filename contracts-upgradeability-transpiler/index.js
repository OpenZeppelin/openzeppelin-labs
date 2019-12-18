const fs = require("fs");

const { getContract, getConstructor } = require("./src/ast-utils");

const { transpile } = require("./src/transpiler");

const {
  transformConstructor,
  transformContractName,
  insertDirective
} = require("./src/transformations");

function transpileConstructor(contractName) {
  const contractData = JSON.parse(
    fs.readFileSync(`./build/contracts/${contractName}.json`)
  );

  const source = contractData.source;

  const contractNode = getContract(contractData.ast, contractName);
  const constructorNode = getConstructor(contractNode);

  const directive = `import "@openzeppelin/upgrades/contracts/Initializable.sol";\n`;

  const finalCode = transpile(source, [
    insertDirective(contractData.ast, directive),
    transformConstructor(constructorNode, source),
    transformContractName(contractNode, source, `${contractName}Upgradable`)
  ]);

  fs.writeFileSync(`./contracts/${contractName}Upgradable.sol`, finalCode);
}

transpileConstructor("GLDToken");
transpileConstructor("Simple");
