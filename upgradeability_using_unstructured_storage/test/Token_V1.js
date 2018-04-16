const Token_V0 = artifacts.require('Token_V0')
const Token_V1 = artifacts.require('Token_V1')
const encodeCall = require('./helpers/encodeCall')
const assertRevert = require('./helpers/assertRevert')
const shouldBehaveLikeTokenV0 = require('./behaviors/token_v0')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')

contract('Token_V1', ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) => {

  beforeEach(async function () {
    const impl_v0 = await Token_V0.new()
    const proxy = await OwnedUpgradeabilityProxy.new({ from: proxyOwner })
    const initializeData = encodeCall('initialize', ['address'], [tokenOwner])
    await proxy.upgradeToAndCall(impl_v0.address, initializeData, { from: proxyOwner })

    const impl_v1 = await Token_V1.new()
    await proxy.upgradeTo(impl_v1.address, { from: proxyOwner })

    this.token = await Token_V1.at(proxy.address)
  })

  shouldBehaveLikeTokenV0(proxyOwner, tokenOwner, owner, recipient, anotherAccount)

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
