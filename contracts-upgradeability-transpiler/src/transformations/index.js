const { appendDirective } = require("./append-directive");
const { prependBaseClass } = require("./prepend-base-class");
const { transformParents } = require("./transform-parents");
const { transformContractName } = require("./transform-contract-name");
const { purgeVarInits } = require("./purge-var-inits");
const { transformConstructor } = require("./transform-constructor");
const { purgeContracts } = require("./purge-contracts");
const { fixImportDirectives } = require("./fix-import-directives");

module.exports = {
  appendDirective,
  prependBaseClass,
  transformConstructor,
  transformContractName,
  purgeContracts,
  transformParents,
  fixImportDirectives,
  purgeVarInits
};
