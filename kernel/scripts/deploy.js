// Deploy registry with sample kernel instance to target network
// Run as: `npx truffle exec scripts/deploy.js --network NETWORK`

const ZepCore = artifacts.require('ZepCore');
const ZepToken = artifacts.require('ZepToken');
const ERC721Token = artifacts.require('ERC721Token');
const KernelInstance = artifacts.require('KernelInstance');
const KernelProxyController = artifacts.require('KernelProxyController');
const UpgradeabilityProxyFactory = artifacts.require('UpgradeabilityProxyFactory');

const version = '1.8.0';
const distribution = 'Zeppelin';
const contractName = 'ERC721Token';

async function deploy() {
  // addresses to use
  const zeppelin = web3.eth.accounts[1];
  const developer = web3.eth.accounts[1];

  console.log("Address: ", zeppelin);
  console.log();

  // deploy new kernel registry and proxy controller
  console.log("Deploying...");
  const newVersionCost = 2;
  const developerFraction = 10;
  const zepCore = await ZepCore.new(newVersionCost, developerFraction, { from: zeppelin });
  console.log(" ZepCore: ", zepCore.address);
  const factory = await UpgradeabilityProxyFactory.new();
  const controller = await KernelProxyController.new(zepCore.address, factory.address);
  console.log(" Controller: ", controller.address);

  // mint zeptokens for the developer
  const zepTokenAddress = await zepCore.token();
  const zepToken = await ZepToken.at(zepTokenAddress);
  await zepToken.mint(developer, newVersionCost, { from: zeppelin });

  // deploy new kernel instance as developer
  const erc721 = await ERC721Token.new();
  console.log(" ERC721 implementation: ", erc721.address);
  const instance = await KernelInstance.new(distribution, version, 0, { from: developer });
  console.log(" Kernel instance: ", instance.address);
  await instance.addImplementation(contractName, erc721.address, { from: developer });

  // register a new kernel instance  
  await zepToken.approve(zepCore.address, newVersionCost, { from: developer });
  await zepCore.register(instance.address, { from: developer });

  // output
  console.log();
  console.log("Deployment complete");
  console.log(" ZepCore: ", zepCore.address);
  console.log(" ZepToken:", zepToken.address);
  console.log(" Controller: ", controller.address);
  console.log();
  console.log("Request an ERC721 instance by running:");
  console.log(` KernelProxyController.at('${controller.address}').create('${distribution}', '${version}', '${contractName}').then(t => t.logs[0].args);`);
}

module.exports = function(cb) {
  deploy().then(cb).catch(cb);
}