const TokenV1_0 = artifacts.require('TokenV1_0')
const TokenV1_1 = artifacts.require('TokenV1_1')

const Registry = artifacts.require('Registry')
const Proxy = artifacts.require('UpgradeabilityProxy')

contract('Upgradeable', function ([sender, receiver]) {

  it('should work', async function () {
    const impl_v1_0 = await TokenV1_0.new()
    const impl_v1_1 = await TokenV1_1.new()

    const registry = await Registry.new()
    await registry.addVersion("1.0", impl_v1_0.address)
    await registry.addVersion("1.1", impl_v1_1.address)

    const {logs} = await registry.createProxy("1.0")

    const {proxy} = logs.find(l => l.event === 'ProxyCreated').args

    await TokenV1_0.at(proxy).mint(sender, 100)

    await Proxy.at(proxy).upgradeTo("1.1")

    await TokenV1_1.at(proxy).mint(sender, 100)

    const transferTx = await TokenV1_1.at(proxy).transfer(receiver, 10, { from: sender })

    console.log("Transfer TX gas cost using Inherited Storage Proxy", transferTx.receipt.gasUsed);

    const balance = await TokenV1_1.at(proxy).balanceOf(sender)
    assert(balance.eq(10190))

  })

})
