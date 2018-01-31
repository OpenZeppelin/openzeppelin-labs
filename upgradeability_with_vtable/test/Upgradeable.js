const TokenV1_Init = artifacts.require('TokenV1_Init')
const TokenV1_Balance = artifacts.require('TokenV1_Balance')
const TokenV1_Transfer= artifacts.require('TokenV1_Transfer')
const TokenV1_Mint = artifacts.require('TokenV1_Mint')
const TokenV1_Interface = artifacts.require('TokenV1_Interface')

const TokenV1_1_Mint = artifacts.require('TokenV1_1_Mint')

const Registry = artifacts.require('Registry')
const Proxy = artifacts.require('Proxy')

contract('Upgradeable', function ([sender, receiver]) {

  let impl_v1_init,
      impl_v1_balance,
      impl_v1_transfer,
      impl_v1_mint,
      registry

  beforeEach(async function() {
    impl_v1_init = await TokenV1_Init.new()
    impl_v1_balance = await TokenV1_Balance.new()
    impl_v1_transfer = await TokenV1_Transfer.new()
    impl_v1_mint = await TokenV1_Mint.new()
    
    registry = await Registry.new()
    
    await registry.addImplementationFromName("1", "initialize(address)", impl_v1_init.address)
    await registry.addImplementationFromName("1", "balanceOf(address)", impl_v1_balance.address)
    await registry.addImplementationFromName("1", "transfer(address,uint256)", impl_v1_transfer.address)
    await registry.addImplementationFromName("1", "mint(address,uint256)", impl_v1_mint.address)
  })

  it('should delegate call to implementation', async function () {
    const {logs} = await registry.create("1")
    const {proxy} = logs.find(l => l.event === 'Created').args
    const token = TokenV1_Interface.at(proxy)
    
    const transferTx = await token.transfer(receiver, 10, { from: sender })
    console.log("Transfer TX gas cost using vtable proxy", transferTx.receipt.gasUsed);

    const balance = await token.balanceOf(sender)
    assert(balance.eq(9990))
  })

  it('should upgrade single function', async function () {
    const {logs} = await registry.create("1")
    const {proxy} = logs.find(l => l.event === 'Created').args
    const token = TokenV1_Interface.at(proxy)

    // Mint and verify that no events are emitted
    const {logs: mintLogs} = await token.mint(sender, 100)
    assert(mintLogs.length == 0);

    // Upload v11 version where mint does emit a transfer event
    const impl_v1_1_mint = await TokenV1_1_Mint.new()
    await registry.addImplementationFromName("1.1", "initialize(address)", impl_v1_init.address)
    await registry.addImplementationFromName("1.1", "balanceOf(address)", impl_v1_balance.address)
    await registry.addImplementationFromName("1.1", "transfer(address,uint256)", impl_v1_transfer.address)
    await registry.addImplementationFromName("1.1", "mint(address,uint256)", impl_v1_1_mint.address)

    // Upgrade the token to that version
    await Proxy.at(token.address).upgradeTo("1.1")

    // Mint and check that now there is a transfer event
    const {logs: mintLogsv11} = await token.mint(sender, 100)
    assert(mintLogsv11.length == 1);
    assert(mintLogsv11[0].event == 'Transfer')

    // Verify state was properly held
    const balance = await token.balanceOf(sender)
    assert(balance.eq(10200))
  })

})
