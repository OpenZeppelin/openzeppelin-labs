const Token_V0 = artifacts.require('Token_V0')
const encodeCall = require('./helpers/encodeCall')
const shouldBehaveLikeTokenV0 = require('./behaviors/token_v0')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')

contract('Token_V0', function ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) {
  beforeEach(async function () {
    const impl_v0 = await Token_V0.new()
    const proxy = await OwnedUpgradeabilityProxy.new({ from: proxyOwner })
    const initializeData = encodeCall('initialize', ['address'], [tokenOwner])
    await proxy.upgradeToAndCall(impl_v0.address, initializeData, { from: proxyOwner })

    this.token = await Token_V0.at(proxy.address)
  })

  shouldBehaveLikeTokenV0(proxyOwner, tokenOwner, owner, recipient, anotherAccount)
})
