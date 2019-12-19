const fs = require("fs");
const find = require("lodash.find");

const { getContract, getConstructor } = require("./src/ast-utils");

const { transpile } = require("./src/transpiler");

const {
  transformConstructor,
  transformContractName,
  appendDirective,
  prependBaseClass,
  moveStateVarsInit
} = require("./src/transformations");

function transpileContracts(contracts, artifacts) {
  return contracts.reduce((acc, contractName) => {
    const artifact = artifacts.find(art => art.contractName === contractName);

    const source = artifact.source;

    const contractNode = getContract(artifact.ast, contractName);
    const constructorNode = getConstructor(contractNode);

    const directive = `\nimport "@openzeppelin/upgrades/contracts/Initializable.sol";`;

    const finalCode = transpile(source, [
      appendDirective(artifact.ast, directive),
      prependBaseClass(contractNode, source, "Initializable"),
      ...transformConstructor(constructorNode, source),
      ...moveStateVarsInit(contractNode, source),
      transformContractName(contractNode, source, `${contractName}Upgradable`)
    ]);

    acc[contractName] = {
      source: finalCode,
      path: artifact.sourcePath.replace(
        contractName,
        `${contractName}Upgradable`
      )
    };
    return acc;
  }, {});
}

const artifacts = fs.readdirSync("./build/contracts/").map(file => {
  return JSON.parse(fs.readFileSync(`./build/contracts/${file}`));
});

const output = transpileContracts(["Simple"], artifacts);

for (const contractName of Object.keys(output)) {
  fs.writeFileSync(
    `./${output[contractName].path}`,
    output[contractName].source
  );
}
