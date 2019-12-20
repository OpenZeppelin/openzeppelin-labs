const fs = require("fs");
const find = require("lodash.find");

const { getContract, getConstructor } = require("./src/ast-utils");

const { transpile } = require("./src/transpiler");

const {
  transformConstructor,
  transformContractName,
  appendDirective,
  prependBaseClass
} = require("./src/transformations");

function transpileContracts(contracts, artifacts) {
  const fileTrans = contracts.reduce((acc, contractName) => {
    const artifact = artifacts.find(art => art.contractName === contractName);

    const source = artifact.source;

    const contractNode = getContract(artifact.ast, contractName);
    const constructorNode = getConstructor(contractNode);

    if (!acc[artifact.fileName]) {
      const directive = `\nimport "@openzeppelin/upgrades/contracts/Initializable.sol";`;

      acc[artifact.fileName] = {
        transformations: [appendDirective(artifact.ast, directive)]
      };
    }

    acc[artifact.fileName].transformations = [
      ...acc[artifact.fileName].transformations,
      prependBaseClass(contractNode, source, "Initializable"),
      ...transformConstructor(contractNode, source),
      transformContractName(contractNode, source, `${contractName}Upgradable`)
    ];

    return acc;
  }, {});

  return contracts.reduce((acc, contractName) => {
    const artifact = artifacts.find(art => art.contractName === contractName);
    const source = artifact.source;

    const file = fileTrans[artifact.fileName];
    if (!file.source) {
      file.source = transpile(source, file.transformations);
    }
    const entry = acc.find(o => o.fileName === artifact.fileName);
    if (!entry) {
      acc.push({
        source: file.source,
        path: artifact.sourcePath.replace(".sol", "Upgradable.sol"),
        fileName: artifact.fileName,
        contracts: [contractName]
      });
    } else {
      entry.contracts.push(contractName);
    }
    return acc;
  }, []);
}

const artifacts = fs.readdirSync("./build/contracts/").map(file => {
  return JSON.parse(fs.readFileSync(`./build/contracts/${file}`));
});

const output = transpileContracts(["Simple", "SimpleInheritanceC"], artifacts);

for (const file of output) {
  fs.writeFileSync(`./${file.path}`, file.source);
}
