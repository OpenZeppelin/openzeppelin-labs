const abi = require('ethereumjs-abi');
const Token_V0 = artifacts.require('Token_V0')
const Token_V1 = artifacts.require('Token_V1')
const EternalStorageProxy = artifacts.require('EternalStorageProxy')
const shouldBehaveLikeTokenV0 = require('./behaviors/token_v0')
const shouldBehaveLikeTokenV1 = require('./behaviors/token_v1')

contract('Token_V1', ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) => {

  beforeEach(async function () {
    const proxy = await EternalStorageProxy.new({ from: proxyOwner })

    const impl_v0 = await Token_V0.new()
    await proxy.upgradeTo('0', impl_v0.address, { from: proxyOwner })

    const impl_v1 = await Token_V1.new()
    const methodId = abi.methodID('initialize', ['address']).toString('hex');
    const params = abi.rawEncode(['address'], [tokenOwner]).toString('hex');
    const initializeData = '0x' + methodId + params;
    await proxy.upgradeToAndCall('1', impl_v1.address, initializeData, { from: proxyOwner })

    this.token = await Token_V1.at(proxy.address)
  })

  shouldBehaveLikeTokenV0(tokenOwner, owner, recipient, anotherAccount)

  shouldBehaveLikeTokenV1(proxyOwner, tokenOwner, owner, anotherAccount)
})
