const fs = require("fs");
const find = require("lodash.find");

const { getContract, getConstructor } = require("./src/ast-utils");

const { transpile } = require("./src/transpiler");

const {
  transformConstructor,
  transformContractName,
  appendDirective,
  prependBaseClass,
  purgeContracts,
  transformParents
} = require("./src/transformations");

const { getInheritanceChain } = require("./src/get-inheritance-chain");

function transpileContracts(contracts, artifacts) {
  const contractsToArtifactsMap = artifacts.reduce((acc, art) => {
    acc[art.contractName] = art;
    return acc;
  }, {});

  const contractsWithInheritance = [
    ...new Set(
      contracts
        .map(contract => [
          contract,
          ...getInheritanceChain(contract, contractsToArtifactsMap)
        ])
        .flat()
    )
  ];

  const fileTrans = contractsWithInheritance.reduce((acc, contractName) => {
    const artifact = contractsToArtifactsMap[contractName];

    const source = artifact.source;

    const contractNode = getContract(artifact.ast, contractName);

    if (!acc[artifact.fileName]) {
      const directive = `\nimport "@openzeppelin/upgrades/contracts/Initializable.sol";`;

      acc[artifact.fileName] = {
        transformations: [
          appendDirective(artifact.ast, directive),
          ...purgeContracts(artifact.ast, contractsWithInheritance)
        ]
      };
    }

    acc[artifact.fileName].transformations = [
      ...acc[artifact.fileName].transformations,
      prependBaseClass(contractNode, source, "Initializable"),
      ...transformParents(contractNode, source),
      ...transformConstructor(contractNode, source),
      transformContractName(contractNode, source, `${contractName}Upgradable`)
    ];

    return acc;
  }, {});

  return contractsWithInheritance.reduce((acc, contractName) => {
    const artifact = contractsToArtifactsMap[contractName];

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

const output = transpileContracts(
  [
    "Simple",
    "SimpleInheritanceC",
    "DiamondD",
    "InheritanceWithParamsConstructorChild",
    "InheritanceWithParamsClassChild"
  ],
  artifacts
);

for (const file of output) {
  fs.writeFileSync(`./${file.path}`, file.source);
}
