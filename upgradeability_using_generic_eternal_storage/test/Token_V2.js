const abi = require('ethereumjs-abi');
const Token_V0 = artifacts.require('Token_V0')
const Token_V1 = artifacts.require('Token_V1')
const Token_V2 = artifacts.require('Token_V2')
const TokenProxy = artifacts.require('TokenProxy')
const assertRevert = require('./helpers/assertRevert')
const shouldBehaveLikeTokenV0 = require('./behaviors/token_v0')
const shouldBehaveLikeTokenV1 = require('./behaviors/token_v1')

contract('Token_V2', ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) => {

  beforeEach(async function () {
    const proxy = await TokenProxy.new({ from: proxyOwner })

    const impl_v0 = await Token_V0.new()
    await proxy.upgradeTo('0', impl_v0.address, { from: proxyOwner })

    const impl_v1 = await Token_V1.new()
    const methodId = abi.methodID('initialize', ['address']).toString('hex');
    const params = abi.rawEncode(['address'], [tokenOwner]).toString('hex');
    const initializeData = '0x' + methodId + params;
    await proxy.upgradeToAndCall('1', impl_v1.address, initializeData, { from: proxyOwner })

    const impl_v2 = await Token_V2.new()
    await proxy.upgradeTo('2', impl_v2.address, { from: proxyOwner })

    this.token = await Token_V2.at(proxy.address)
  })

  shouldBehaveLikeTokenV0(tokenOwner, owner, recipient, anotherAccount)

  shouldBehaveLikeTokenV1(proxyOwner, tokenOwner, owner, anotherAccount)

  describe('burn', function () {
    const from = owner

    beforeEach(async function () {
      await this.token.mint(owner, 100, { from: tokenOwner })
    })

    describe('when the given amount is not greater than balance of the sender', function () {
      const amount = 100

      it('burns the requested amount', async function () {
        await this.token.burn(amount, { from })

        const balance = await this.token.balanceOf(from)
        assert.equal(balance, 0)
      })

      it('emits a burn event', async function () {
        const { logs } = await this.token.burn(amount, { from })

        assert.equal(logs.length, 1)
        assert.equal(logs[0].event, 'Burn')
        assert.equal(logs[0].args.burner, owner)
        assert.equal(logs[0].args.value, amount)
      })
    })

    describe('when the given amount is greater than the balance of the sender', function () {
      const amount = 101

      it('reverts', async function () {
        await assertRevert(this.token.burn(amount, { from }))
      })
    })
  })
})
