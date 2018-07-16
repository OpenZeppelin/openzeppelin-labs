const App = require('zos-lib').App;
const Proxy = require('zos-lib').Proxy;
const fs = require('fs');
const process = require('process');

global.artifacts = artifacts;
global.web3 = web3;

async function queryProxy(networkName, contractName) {
  if (!contractName) {
    throw Error("Contract name of the proxy to change ownership is required");
  }
  
  const networkInfo = JSON.parse(fs.readFileSync(`zos.${networkName}.json`));
  const proxiesOfContract = networkInfo.proxies[contractName];

  if (!proxiesOfContract || proxiesOfContract.length === 0) {
    throw Error(`No deployed proxies of contract ${contractName} found`);
  } else if (proxiesOfContract.length > 1) {
    throw Error(`Multiple proxies of contract ${contractName} found`);
  }

  const proxyAddress = proxiesOfContract[0].address;
  const proxy = await Proxy.at(proxyAddress);
  const admin = await proxy.admin();
  const implementation = await proxy.implementation();
  console.log("Admin is", pp(admin));
  console.log("Implementation is", pp(implementation));
}

function pp(address) {
  return address.replace('0x000000000000000000000000', '0x');
}

module.exports = function(cb) {
  const scriptIndex = process.argv.indexOf('query.js');
  const networkIndex = process.argv.indexOf('--network');
  queryProxy(process.argv[networkIndex+1], process.argv[scriptIndex+1])
    .then(() => cb())
    .catch(err => cb(err));
}