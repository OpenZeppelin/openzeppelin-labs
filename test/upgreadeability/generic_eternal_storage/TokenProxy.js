const assertRevert = require('../../helpers/assertRevert')

const Token_V0 = artifacts.require('GES_Token_V0')
const Token_V1 = artifacts.require('GES_Token_V1')
const TokenProxy = artifacts.require('GES_TokenProxy')
const UpgradeabilityStorage = artifacts.require('GES_UpgradeabilityStorage')

contract('TokenProxy with generic Eternal Storage', function ([owner, sender, receiver]) {
  let proxy
  let proxyAddress

  beforeEach(async function () {
    proxy = await TokenProxy.new()
    proxyAddress = proxy.address
  })

  it('does not have a version neither an implementation initially', async function () {
    const version = await UpgradeabilityStorage.at(proxyAddress).version();
    const implementation = await UpgradeabilityStorage.at(proxyAddress).implementation();

    assert.equal(version, '');
    assert.equal(implementation, 0x0);
  })

  it('reverts when no implementation was given', async function () {
    await assertRevert(Token_V0.at(proxyAddress).totalSupply());
    await assertRevert(Token_V0.at(proxyAddress).mint(sender, 100));
  })

  it('can be upgraded to a first version', async function () {
    const impl_v0 = await Token_V0.new()
    await proxy.upgradeTo('0', impl_v0.address)

    // Should be initialized correctly
    await assert.equal(false, await Token_V0.at(proxyAddress).initialized())
    await Token_V0.at(proxyAddress).initialize({ from: owner })
    await assert.equal(true, await Token_V0.at(proxyAddress).initialized())

    // Check the token owner
    await assert.equal(owner, await Token_V0.at(proxyAddress).getOwner())

    const version = await proxy.version();
    await assert.equal(version, '0');

    const implementation = await proxy.implementation();
    assert.equal(implementation, impl_v0.address);

    await Token_V0.at(proxyAddress).mint(sender, 100, { from: owner })

    const balance = await Token_V0.at(proxyAddress).balanceOf(sender)
    assert(balance.eq(100))

    const totalSupply = await Token_V0.at(proxyAddress).totalSupply()
    assert(totalSupply.eq(100))

    await assertRevert(Token_V1.at(proxyAddress).burn(100))
  })

  it('can be upgraded to a second version with new function', async function () {
    const impl_v0 = await Token_V0.new()
    await proxy.upgradeTo('0', impl_v0.address)

    // Should be initialized correctly
    await assert.equal(false, await Token_V0.at(proxyAddress).initialized())
    await Token_V0.at(proxyAddress).initialize({ from: owner })
    await assert.equal(true, await Token_V0.at(proxyAddress).initialized())

    // Check the token owner
    await assert.equal(owner, await Token_V0.at(proxyAddress).getOwner())

    // It should be able to mint at version 0
    await Token_V0.at(proxyAddress).mint(sender, 100, { from: owner })
    await assertRevert(Token_V0.at(proxyAddress).mint(sender, 100, { from: sender }))

    // Check balance and total supply
    const balanceV0 = await Token_V1.at(proxyAddress).balanceOf(sender)
    assert(balanceV0.eq(100))
    const totalSupplyV0 = await Token_V1.at(proxyAddress).totalSupply()
    assert(totalSupplyV0.eq(100))

    // When try to burn with version 0 it should revert
    await assertRevert(Token_V1.at(proxyAddress).burn(50, { from: sender }))

    // Upgrade to version 1
    const impl_v1 = await Token_V1.new()
    await proxy.upgradeTo('1', impl_v1.address)

    // Proxy was already initialized in V0
    await assert.equal(true, await Token_V1.at(proxyAddress).initialized())

    // Get the same owner as previous version
    await assert.equal(owner, await Token_V1.at(proxyAddress).getOwner())

    // Check the version
    const version = await proxy.version()
    await assert.equal(version, '1');

    // Check the implementation address
    const implementation = await proxy.implementation()
    assert.equal(implementation, impl_v1.address)

    // It should be able to burn in version 1
    await Token_V1.at(proxyAddress).burn(50, { from: sender })

    const transferTx = await Token_V1.at(proxyAddress).transfer(receiver, 10, { from: sender })

    console.log("Transfer TX gas cost using Eternal Storage Proxy", transferTx.receipt.gasUsed);

    // Check balance and total supply
    const balance = await Token_V1.at(proxyAddress).balanceOf(sender)
    assert(balance.eq(40))
    const totalSupply = await Token_V1.at(proxyAddress).totalSupply()
    assert(totalSupply.eq(50))
  })

})
