const { getVarDeclarations, getNodeSources } = require("../ast-utils");

function purgeVarInits(contractNode, source) {
  const varDeclarations = getVarDeclarations(contractNode);
  return varDeclarations
    .filter(vr => vr.value && !vr.constant)
    .map(vr => {
      const [start, len, varSource] = getNodeSources(vr, source);
      const match = /(.*)(=.*)/.exec(varSource);
      if (!match) throw new Error(`Can't find = in ${varSource}`);
      return {
        start: start + match[1].length,
        end: start + match[1].length + match[2].length,
        text: ""
      };
    });
}

module.exports = { purgeVarInits };
