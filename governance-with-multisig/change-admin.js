const App = require('zos-lib').App;
const Proxy = require('zos-lib').Proxy;
const fs = require('fs');
const process = require('process');

global.artifacts = artifacts;
global.web3 = web3;

async function changeOwner(networkName, contractName, newAdmin) {
  if (!contractName) {
    throw Error("Contract name of the proxy to change ownership is required");
  }
  
  if (!newAdmin) {
    throw Error("New admin address is required");
  }

  console.log(`Changing admin of proxy ${contractName} to ${newAdmin}`);

  const networkInfo = JSON.parse(fs.readFileSync(`zos.${networkName}.json`));
  const appAddress = networkInfo.app.address;
  const proxiesOfContract = networkInfo.proxies[contractName];

  if (!proxiesOfContract || proxiesOfContract.length === 0) {
    throw Error(`No deployed proxies of contract ${contractName} found`);
  } else if (proxiesOfContract.length > 1) {
    throw Error(`Multiple proxies of contract ${contractName} found`);
  }

  const proxyAddress = proxiesOfContract[0].address;
  const proxy = await Proxy.at(proxyAddress);
  console.log("Previous admin is", (await proxy.admin()));

  const app = await App.fetch(appAddress);
  await app.changeProxyAdmin(proxyAddress, newAdmin);
  console.log("Successfully changed admin to", newAdmin);
}

module.exports = function(cb) {
  const scriptIndex = process.argv.indexOf('change-admin.js');
  const networkIndex = process.argv.indexOf('--network');
  changeOwner(process.argv[networkIndex+1], process.argv[scriptIndex+1], process.argv[scriptIndex+2])
    .then(() => cb())
    .catch(err => cb(err));
}
