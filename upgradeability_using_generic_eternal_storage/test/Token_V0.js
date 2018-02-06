const Token_V0 = artifacts.require('Token_V0')
const EternalStorageProxy = artifacts.require('EternalStorageProxy')
const shouldBehaveLikeTokenV0 = require('./behaviors/token_v0')

contract('Token_V0', function ([_, proxyOwner, owner, recipient, anotherAccount]) {
  beforeEach(async function () {
    const proxy = await EternalStorageProxy.new({ from: proxyOwner })
    const impl_v0 = await Token_V0.new()
    await proxy.upgradeTo('0', impl_v0.address, { from: proxyOwner })
    this.token = await Token_V0.at(proxy.address)
  })

  shouldBehaveLikeTokenV0(owner, owner, recipient, anotherAccount)
})
