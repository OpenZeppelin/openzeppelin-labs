const path = require("path");
const fs = require("fs-extra");

const { getContract, isContract } = require("./src/ast-utils");

const { transpile } = require("./src/transpiler");

const {
  transformConstructor,
  transformContractName,
  appendDirective,
  prependBaseClass,
  purgeContracts,
  transformParents,
  fixImportDirectives,
  purgeVarInits
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
  ].filter(contract => {
    const artifact = contractsToArtifactsMap[contract];
    const contractNode = getContract(artifact.ast, contract);
    return isContract(contractNode);
  });

  const fileTrans = contractsWithInheritance.reduce((acc, contractName) => {
    const artifact = contractsToArtifactsMap[contractName];

    const source = artifact.source;

    const contractNode = getContract(artifact.ast, contractName);

    if (!acc[artifact.fileName]) {
      const directive = `\nimport "@openzeppelin/upgrades/contracts/Initializable.sol";`;

      acc[artifact.fileName] = {
        transformations: [
          appendDirective(artifact.ast, directive),
          ...fixImportDirectives(artifact, artifacts, contractsWithInheritance),
          ...purgeContracts(artifact.ast, contractsWithInheritance)
        ]
      };
    }

    acc[artifact.fileName].transformations = [
      ...acc[artifact.fileName].transformations,
      prependBaseClass(contractNode, source, "Initializable"),
      ...transformParents(contractNode, source, contractsWithInheritance),
      ...transformConstructor(contractNode, source, contractsWithInheritance),
      ...purgeVarInits(contractNode, source),
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

async function main() {
  const artifacts = fs.readdirSync("./build/contracts/").map(file => {
    return JSON.parse(fs.readFileSync(`./build/contracts/${file}`));
  });

  const output = transpileContracts(
    [
      // "GLDToken",
      "Simple",
      "DiamondC"
    ],
    artifacts
  );

  for (const file of output) {
    let patchedFilePath = file.path;
    if (file.path.startsWith("contracts")) {
      patchedFilePath = file.path.replace("contracts/", "");
    }
    await fs.ensureDir(path.dirname(`./contracts/${patchedFilePath}`));
    fs.writeFileSync(`./contracts/${patchedFilePath}`, file.source);
  }
}

main().then(() => {
  // waiting for the fix of an issue
  // https://github.com/prettier-solidity/prettier-plugin-solidity/issues/211
  // require("child_process").execSync("npx prettier --write **/*.sol");
});
