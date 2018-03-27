const abi = require('ethereumjs-abi')

function signature(name, arguments) {
  return '0x' + abi.methodID(name, arguments).toString('hex');
}

module.exports = signature;