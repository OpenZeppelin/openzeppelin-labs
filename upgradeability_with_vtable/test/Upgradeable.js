const signature = require('./helpers/signature')
const assertRevert = require('./helpers/assertRevert')

const TokenV0_Init = artifacts.require('TokenV0_Init')
const TokenV0_Balance = artifacts.require('TokenV0_Balance')
const TokenV0_Transfer= artifacts.require('TokenV0_Transfer')
const TokenV0_Mint = artifacts.require('TokenV0_Mint')
const TokenV0_Interface = artifacts.require('TokenV0_Interface')
const TokenV1_Mint = artifacts.require('TokenV1_Mint')
const TokenV1_Transfer = artifacts.require('TokenV1_Transfer')
const TokenV1_Burn = artifacts.require('TokenV1_Burn')
const TokenV2_Fallback = artifacts.require('TokenV2_Fallback')
const TokenV1_Interface = artifacts.require('TokenV1_Interface')

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
      impl_v1_burn,
      impl_v2_fallback,
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
    impl_v1_burn = await TokenV1_Burn.new()
    impl_v2_fallback = await TokenV2_Fallback.new()
    registry = await Registry.new()
    
    // Register V0 implementations
    await registry.addVersionFromName('0', 'initialize(address)', impl_v0_init.address)
    await registry.addVersionFromName('0', 'balanceOf(address)', impl_v0_balance.address)
    await registry.addVersionFromName('0', 'transfer(address,uint256)', impl_v0_transfer.address)
    await registry.addVersionFromName('0', 'mint(address,uint256)', impl_v0_mint.address)

    // Register V1 implementations
    await registry.addVersionFromName('1', 'safeTransfer(address,uint256)', impl_v1_transfer.address)
    await registry.addVersionFromName('1', 'mint(address,uint256)', impl_v1_mint.address)
    await registry.addVersionFromName('1', 'burn(address,uint256)', impl_v1_burn.address)

    // Register unchanged V1 functions using V0 implementations
    await registry.addVersionFromName('1', 'initialize(address)', impl_v0_init.address)
    await registry.addVersionFromName('1', 'balanceOf(address)', impl_v0_balance.address)

    // Register V2 fallback function, plus all the former functions from V1
    await registry.addFallback('2', impl_v2_fallback.address)
    await registry.addVersionFromName('2', 'safeTransfer(address,uint256)', impl_v1_transfer.address)
    await registry.addVersionFromName('2', 'mint(address,uint256)', impl_v1_mint.address)
    await registry.addVersionFromName('2', 'burn(address,uint256)', impl_v1_burn.address)
    await registry.addVersionFromName('2', 'initialize(address)', impl_v0_init.address)
    await registry.addVersionFromName('2', 'balanceOf(address)', impl_v0_balance.address)

    // Create proxy
    const { logs } = await registry.createProxy('0', { from: sender })
    const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy
    proxy = await UpgradeabilityProxy.at(proxyAddress)
  })

  describe('on V0', function () {    
    beforeEach(async function() {
      token = await TokenV0_Interface.at(proxy.address)
    })

    it('executes initializer minting initial tokens', async function () {
      const balance = await token.balanceOf(sender)
      assert(balance.eq(10000))
    })
    
    it('reverts when a called function does not exist', async function () {
      tokenv1 = await TokenV1_Interface.at(proxy.address)
      await assertRevert(tokenv1.burn(sender, 1))
    })

    it('invokes correct version of transfer', async function() {
      const { logs: transfer_v0_logs } = await token.transfer(receiver, 100, { from: sender })
      assert.equal(transfer_v0_logs.length, 0)

      const balance = await token.balanceOf(sender)
      assert(balance.eq(10000 - 100))
    })

    it('invokes correct version of mint', async function() {
      const { logs: mint_v0_logs } = await token.mint(sender, 200)
      assert.equal(mint_v0_logs.length, 0)

      const balance = await token.balanceOf(sender)
      assert(balance.eq(10000 + 200))
    })

  })

  describe('on V1', function () {
    
    beforeEach(async function() {
      token = await TokenV1_Interface.at(proxy.address)
      await proxy.upgradeTo('1')
    })

    it('delegates call to the previous implementation', async function () {
      const balance = await token.balanceOf(sender)
      assert(balance.eq(10000))
    })

    it('invokes new version of mint', async function () {
      const { logs: mint_v1_logs } = await token.mint(sender, 200)
      assert.equal(mint_v1_logs.length, 1)
      assert.equal(mint_v1_logs[0].event, 'Transfer')
      assert.equal(mint_v1_logs[0].args.from, 0x0)
      assert.equal(mint_v1_logs[0].args.to, sender)
      assert.equal(mint_v1_logs[0].args.value, 200)

      const balance = await token.balanceOf(sender)
      assert(balance.eq(10000 + 200))
    })

    it('invokes new version of transfer named safeTransfer', async function () {
      const { logs: transfer_v1_logs } = await token.safeTransfer(receiver, 100, { from: sender })
      assert.equal(transfer_v1_logs.length, 1)
      assert.equal(transfer_v1_logs[0].event, 'Transfer')
      assert.equal(transfer_v1_logs[0].args.from, sender)
      assert.equal(transfer_v1_logs[0].args.to, receiver)
      assert.equal(transfer_v1_logs[0].args.value, 100)

      const senderBalance = await token.balanceOf(sender)
      assert(senderBalance.eq(10000 - 100))

      const receiverBalance = await token.balanceOf(receiver)
      assert(receiverBalance.eq(100))
    })

    it('fails to invoke removed transfer version', async function() {
      await assertRevert(token.transfer(receiver, 100, { from: sender }))
      const senderBalance = await token.balanceOf(sender)
      assert(senderBalance.eq(10000))
    })

    it('has no fallback function', async function() {
      await assertRevert(token.sendTransaction({ value: 100, from: sender }))
      const senderBalance = await token.balanceOf(sender)
      assert(senderBalance.eq(10000))
    })    

  })

  describe('on V2', function () {
    
    beforeEach(async function() {
      token = await TokenV1_Interface.at(proxy.address)
      await proxy.upgradeTo('1')
      await proxy.upgradeTo('2')
    })

    it('delegates call to the previous implementation', async function () {
      const balance = await token.balanceOf(sender)
      assert(balance.eq(10000))
    })

    it('has a fallback function', async function() {
      await token.sendTransaction({ value: 100, from: sender })
      const senderBalance = await token.balanceOf(sender)
      assert(senderBalance.eq(10100))
    })    

  })
})
