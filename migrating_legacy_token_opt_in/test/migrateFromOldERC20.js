'use strict'

const abi = require('ethereumjs-abi')
const MyToken_V0 = artifacts.require('MyToken_V0')
const MyToken_V1 = artifacts.require('MyToken_V1')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')

contract('LegacyToken migration', function ([_, legacyTokenOwner, proxyOwner, burnAddress, holder_1, holder_2, holder_3, holder_4 ]) {
  const holders = [holder_1, holder_2, holder_3, holder_4]

  beforeEach('deploy LegacyToken and mint tokens', async function () {
    this.legacyToken = await MyToken_V0.new({ from: legacyTokenOwner })
    await Promise.all(holders.map((holder, i) => this.legacyToken.mint(holder, (i+1) * 10, { from: legacyTokenOwner })))
  })

  beforeEach('deploy new upgradeable token', async function () {
    const argTypes = ['address', 'address']
    const argValues = [this.legacyToken.address, burnAddress]
    const methodId = abi.methodID('initialize', argTypes).toString('hex')
    const params = abi.rawEncode(argTypes, argValues).toString('hex')
    const initializeData = '0x' + methodId + params

    const proxy = await OwnedUpgradeabilityProxy.new({ from: proxyOwner })
    const newTokenImplementation = await MyToken_V1.new()
    await proxy.upgradeToAndCall(newTokenImplementation.address, initializeData, { from: proxyOwner })
    this.newToken = MyToken_V1.at(proxy.address)
  })

  beforeEach('migrating balances', async function () {
    this.previousBalances = {}
    await Promise.all(holders.map(async holder => {
      this.previousBalances[holder] = await this.legacyToken.balanceOf(holder)
      await this.legacyToken.approve(this.newToken.address, this.previousBalances[holder], { from: holder })
      return this.newToken.migrateToken(this.previousBalances[holder], { from: holder })
    }))
  })

  describe('migrate', function () {
    it('maintains correct balances', async function () {
      await Promise.all(holders.map(async holder => {
        const legacyTokenBalance = await this.legacyToken.balanceOf(holder)
        assert(legacyTokenBalance.eq(0))

        const newTokenBalance = await this.newToken.balanceOf(holder)
        assert(this.previousBalances[holder].eq(newTokenBalance))
      }))
    })

    it('burn address should hold the total supply of the legacy token', async function() {
      const totalSupplyLegacy = await this.legacyToken.totalSupply()
      const balanceOfBurnContract = await this.legacyToken.balanceOf(burnAddress)

      assert(totalSupplyLegacy.eq(balanceOfBurnContract))
    })

    it('total supply of the burn address should be equal to the total supply of the new token', async function() {
      const totalSupplyUpgraded = await this.newToken.totalSupply()
      const balanceOfBurnContract = await this.legacyToken.balanceOf(burnAddress)

      assert(totalSupplyUpgraded.eq(balanceOfBurnContract))
    })
  })

  describe('new ERC20', function () {
    it('transfer tokens between accounts', async function () {
      await this.newToken.transfer(holder_2, 10, { from: holder_1 })
      const senderNewBalance = await this.newToken.balanceOf(holder_1)
      const recipientNewBalance = await this.newToken.balanceOf(holder_2)

      assert(senderNewBalance.eq(0))
      assert(recipientNewBalance.eq(30))
    })

    it('can approve spenders', async function () {
      await this.newToken.approve(holder_2, 10, { from: holder_1 })
      const allowance = await this.newToken.allowance(holder_1, holder_2)

      assert(allowance.eq(10))
    })

    it('can transfer tokens from foreign accounts', async function () {
      await this.newToken.approve(holder_2, 10, { from: holder_1 })
      await this.newToken.safeTransferFrom(holder_1, holder_3, 10, { from: holder_2 })

      const allowance = await this.newToken.allowance(holder_1, holder_2)
      const senderNewBalance = await this.newToken.balanceOf(holder_1)
      const recipientNewBalance = await this.newToken.balanceOf(holder_3)

      assert(allowance.eq(0))
      assert(senderNewBalance.eq(0))
      assert(recipientNewBalance.eq(40))
    })
  })
})
