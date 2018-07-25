const AdminUpgradeabilityProxy = artifacts.require('AdminUpgradeabilityProxy');

require('chai').should();

const log = function (text) {
  console.log('        ' + text);
};

function getGas(contract) {
  return web3.eth.getTransactionReceipt(contract.transactionHash).gasUsed;
}

contract('Contracts', function ([owner, user]) {
  const shouldDeploy = function(contractName) {
    describe(contractName, function () {
      beforeEach(function () {
        this.Original = artifacts.require(contractName);
        this.Initializer = artifacts.require(contractName + '_initializer');
        this.Implementation = artifacts.require(contractName + '_implementation');
      })

      describe('without zOS', function () {
        it('should initialize the contract', async function () {
          log('Deploying original contract...')
          const instance = await this.Original.new(100, 'FooToken', 'FOO', 8);
          log('  Gas used: ' + getGas(instance))
        });
      });
  
      describe('via zOS', function () {
        it('should initialize the contract', async function () {
          log('Deploying initializer version...')
          const initializer = await this.Initializer.new();
          log('  Gas used: ' + getGas(initializer));
          log('Deploying implementation...')
          const implementation = await this.Implementation.new();
          log('  Gas used: ' + getGas(implementation));
          const initData = initializer.initializer.request(100, 'FooToken', 'FOO', 8).params[0].data;
          log('Deploying proxy...')
          const proxy = await AdminUpgradeabilityProxy.new(initializer.address, implementation.address, initData);
          log('  Gas used: ' + getGas(proxy));
          const instance = this.Original.at(proxy.address);
        });
      });
    });
  };

  shouldDeploy('MyToken');
  shouldDeploy('MyNFT');
});