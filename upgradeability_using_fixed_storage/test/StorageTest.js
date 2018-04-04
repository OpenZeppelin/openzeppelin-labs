
const encodeCall = require('./helpers/encodeCall')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')
const Token_V0 = artifacts.require('Token_V0')

contract('OwnedUpgradeabilityProxy', ([_, proxyOwner, tokenOwner, anotherAccount]) => {
  let proxy
  let impl_v0
  let token_v0
  const initializeData = encodeCall('initialize', ['address'], [tokenOwner]);

  beforeEach(async function () {
    proxy = await OwnedUpgradeabilityProxy.new({ from: proxyOwner })
    impl_v0 = await Token_V0.new()
    token_v0 = Token_V0.at(proxy.address)
    const initializeData = encodeCall('initialize', ['address'], [tokenOwner])
    await proxy.upgradeToAndCall(impl_v0.address, initializeData, { from: proxyOwner })
  });

  it('should store implementation in specified location', async function () {
    const position = web3.sha3("org.zeppelinos.proxy.implementation");
    const storage = await web3.eth.getStorageAt(proxy.address, position);
    assert.equal(storage, impl_v0.address);
  });
  
});