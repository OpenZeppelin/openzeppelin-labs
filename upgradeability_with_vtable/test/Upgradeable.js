const signature = require('./helpers/signature')
const assertRevert = require('./helpers/assertRevert')
const TokenV0_Init = artifacts.require('TokenV0_Init')
const TokenV0_Balance = artifacts.require('TokenV0_Balance')
const TokenV0_Transfer= artifacts.require('TokenV0_Transfer')
const TokenV0_Mint = artifacts.require('TokenV0_Mint')
const TokenV0_Interface = artifacts.require('TokenV0_Interface')
const TokenV1_Mint = artifacts.require('TokenV1_Mint')
const TokenV1_Transfer = artifacts.require('TokenV1_Transfer')

const Proxy = artifacts.require('Proxy')
const Registry = artifacts.require('Registry')
const UpgradeabilityProxy = artifacts.require('UpgradeabilityProxy')

contract('Upgradeable', function ([_, sender, receiver]) {
  let impl_v0_init,
      impl_v0_balance,
      impl_v0_transfer,
      impl_v1_transfer,
      impl_v0_mint,
      impl_v1_mint,
      registry,
      proxy,
      token

  beforeEach(async function() {
    // Deploy functions implementations
    impl_v0_init = await TokenV0_Init.new()
    impl_v0_balance = await TokenV0_Balance.new()
    impl_v0_transfer = await TokenV0_Transfer.new()
    impl_v0_mint = await TokenV0_Mint.new()
    impl_v1_transfer = await TokenV1_Transfer.new()
    impl_v1_mint = await TokenV1_Mint.new()
    registry = await Registry.new()
    
    // Register V0 implementations
    await registry.addVersionFromName('0', 'initialize(address)', impl_v0_init.address)
    await registry.addVersionFromName('0', 'balanceOf(address)', impl_v0_balance.address)
    await registry.addVersionFromName('0', 'transfer(address,uint256)', impl_v0_transfer.address)
    await registry.addVersionFromName('0', 'mint(address,uint256)', impl_v0_mint.address)

    // Register V1 implementations
    await registry.addVersionFromName('1', 'transfer(address,uint256)', impl_v1_transfer.address)
    await registry.addVersionFromName('1', 'mint(address,uint256)', impl_v1_mint.address)

    // Create proxy
    const initializeID = signature('initialize', ['address'])
    const mintID = signature('mint', ['address', 'uint256'])
    const { logs } = await registry.createProxy('0', [initializeID, mintID], { from: sender })
    const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy
    proxy = await UpgradeabilityProxy.at(proxyAddress)
    token = await TokenV0_Interface.at(proxyAddress)
  })

  describe('initialization', function () {
    describe('when a called function was not upgraded to the initial version yet', function () {
      it('reverts', async function () {
        await assertRevert(token.balanceOf(sender))
      })
    })

    describe('when a called function was upgraded to the initial version', function () {
      beforeEach(async function () {
        await proxy.upgradeTo('0', signature('balanceOf', ['address']))
      })

      it('delegates that call to the upgraded implementation', async function () {
        const balance = await token.balanceOf(sender)
        assert(balance.eq(10000))
      })
    })
  })

  describe('upgradeability', function () {
    beforeEach(async function () {
      await proxy.upgradeTo('0', signature('balanceOf', ['address']))
      await proxy.upgradeTo('0', signature('transfer', ['address', 'uint256']))
    })

    it('can upgrade a single function', async function () {
      const { logs: transfer_v0_logs } = await token.transfer(receiver, 100, { from: sender })
      assert.equal(transfer_v0_logs.length, 0)

      const { logs: mint_v0_logs } = await token.mint(sender, 200)
      assert.equal(mint_v0_logs.length, 0)

      await proxy.upgradeTo('1', signature('transfer', ['address', 'uint256']))

      const { logs: transfer_v1_logs } = await token.transfer(receiver, 100, { from: sender })
      assert.equal(transfer_v1_logs.length, 1)
      assert.equal(transfer_v1_logs[0].event, 'Transfer')
      assert.equal(transfer_v1_logs[0].args.from, sender)
      assert.equal(transfer_v1_logs[0].args.to, receiver)
      assert.equal(transfer_v1_logs[0].args.value, 100)

      const { logs: mint_v1_logs } = await token.mint(sender, 200)
      assert.equal(mint_v1_logs.length, 0)

      const senderBalance = await token.balanceOf(sender)
      assert(senderBalance.eq(10200))

      const receiverBalance = await token.balanceOf(receiver)
      assert(receiverBalance.eq(200))
    })

    it('can upgrade a single function', async function () {
      const { logs: transfer_v0_logs } = await token.transfer(receiver, 100, { from: sender })
      assert.equal(transfer_v0_logs.length, 0)

      const { logs: mint_v0_logs } = await token.mint(sender, 200)
      assert.equal(mint_v0_logs.length, 0)

      await proxy.upgradeTo('1', signature('transfer', ['address', 'uint256']))
      await proxy.upgradeTo('1', signature('mint', ['address', 'uint256']))

      const { logs: transfer_v1_logs } = await token.transfer(receiver, 100, { from: sender })
      assert.equal(transfer_v1_logs.length, 1)
      assert.equal(transfer_v1_logs[0].event, 'Transfer')
      assert.equal(transfer_v1_logs[0].args.from, sender)
      assert.equal(transfer_v1_logs[0].args.to, receiver)
      assert.equal(transfer_v1_logs[0].args.value, 100)

      const { logs: mint_v1_logs } = await token.mint(sender, 200)
      assert.equal(mint_v1_logs[0].event, 'Transfer')
      assert.equal(mint_v1_logs[0].args.from, 0x0)
      assert.equal(mint_v1_logs[0].args.to, sender)
      assert.equal(mint_v1_logs[0].args.value, 200)

      const senderBalance = await token.balanceOf(sender)
      assert(senderBalance.eq(10200))

      const receiverBalance = await token.balanceOf(receiver)
      assert(receiverBalance.eq(200))
    })
  })
})
