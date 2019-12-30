const { getImportDirectives, getSourceIndices } = require("../ast-utils");

function fixImportDirectives(artifact, artifacts, contracts) {
  const imports = getImportDirectives(artifact.ast);
  return imports.map(imp => {
    const [start, len] = getSourceIndices(imp);
    const isTranspiled = artifacts.some(
      art =>
        art.ast.id === imp.sourceUnit &&
        contracts.some(contract => contract === art.contractName)
    );
    const prefix = !imp.file.startsWith(".") ? "./" : "";
    let fixedPath = `import "${prefix}${imp.file.replace(
      ".sol",
      "Upgradable.sol"
    )}";`;
    return {
      start,
      end: start + len,
      text: !isTranspiled ? `import "${imp.absolutePath}";` : fixedPath
    };
  });
}

module.exports = { fixImportDirectives };
