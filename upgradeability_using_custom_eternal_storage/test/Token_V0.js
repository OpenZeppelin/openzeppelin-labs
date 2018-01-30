const abi = require('ethereumjs-abi')
const Token_V0 = artifacts.require('Token_V0')
const TokenProxy = artifacts.require('TokenProxy')
const shouldBehaveLikeTokenV0 = require('./behaviors/token_v0')

contract('Token_V0', function ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) {
  beforeEach(async function () {
    const proxy = await TokenProxy.new({ from: proxyOwner })
    const impl_v0 = await Token_V0.new()
    const methodId = abi.methodID('initialize', ['address']).toString('hex')
    const params = abi.rawEncode(['address'], [tokenOwner]).toString('hex')
    const initializeData = '0x' + methodId + params
    await proxy.upgradeToAndCall('0', impl_v0.address, initializeData, { from: proxyOwner })

    this.token = await Token_V0.at(proxy.address)
  })

  shouldBehaveLikeTokenV0(proxyOwner, tokenOwner, owner, recipient, anotherAccount)
})
