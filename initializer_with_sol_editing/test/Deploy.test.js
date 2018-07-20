const MyContract_original = artifacts.require('MyContract');
const MyContract_initializer = artifacts.require('MyContract_initializer');
const MyContract_implementation = artifacts.require('MyContract_implementation');
const AdminUpgradeabilityProxy = artifacts.require('AdminUpgradeabilityProxy');

require('chai').should();

const log = function (text) {
  //console.log(text);
};

contract('MyContract', function ([owner, user]) {

  describe('without zOS', function () {
    it('should initialize the contract', async function () {
      log('Deploying original contract...')
      const instance = await MyContract_original.new(42);
      log('Calling value() at instance...')
      const actualValue = await instance.value();
      actualValue.toNumber().should.eq(42);
    });
  });

  describe('via zOS', function () {
    it('should initialize the contract', async function () {
      log('Deploying initializer version...')
      const initializer = await MyContract_initializer.new();
      log('Deploying implementation...')
      const implementation = await MyContract_implementation.new();
      const initData = initializer.initializer.request(42).params[0].data;
      log('Deploying proxy...')
      const proxy = await AdminUpgradeabilityProxy.new(initializer.address, implementation.address, initData);
      const instance = MyContract_original.at(proxy.address);
      log('Calling value() at instance...')
      const actualValue = await instance.value({ from: user });
      actualValue.toNumber().should.eq(42);
    });
  });

});