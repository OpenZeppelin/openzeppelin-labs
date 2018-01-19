const assertRevert = require('../../helpers/assertRevert')

const TokenProxy = artifacts.require('TokenProxy')
const UpgradeabilityStorage = artifacts.require('UpgradeabilityStorage')
const Token_V0 = artifacts.require('eternal_storage/test/Token_V0')
const Token_V1 = artifacts.require('eternal_storage/test/Token_V1')

contract('TokenProxy', function ([sender, nonOwner]) {
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

  it('only the proxy owner can upgrade', async function() {
    const impl_v0 = await Token_V0.new()
    await assertRevert(proxy.upgradeTo('0', impl_v0.address, {from: nonOwner}));
  })

  it('can be upgraded to a first version', async function () {
    const impl_v0 = await Token_V0.new()
    await proxy.upgradeTo('0', impl_v0.address)

    const version = await proxy.version();
    await assert.equal(version, '0');

    const implementation = await proxy.implementation();
    assert.equal(implementation, impl_v0.address);

    await Token_V0.at(proxyAddress).mint(sender, 100)

    const balance = await Token_V0.at(proxyAddress).balanceOf(sender)
    assert(balance.eq(100))

    const totalSupply = await Token_V0.at(proxyAddress).totalSupply()
    assert(totalSupply.eq(100))

    await assertRevert(Token_V1.at(proxyAddress).burn(100))
  })

  it('can be upgraded to a second version', async function () {
    const impl_v0 = await Token_V0.new()
    await proxy.upgradeTo('0', impl_v0.address)
    const impl_v1 = await Token_V1.new()
    await proxy.upgradeTo('1', impl_v1.address)

    const version = await proxy.version();
    await assert.equal(version, '1');

    const implementation = await proxy.implementation();
    assert.equal(implementation, impl_v1.address);

    await Token_V1.at(proxyAddress).mint(sender, 100)
    await Token_V1.at(proxyAddress).burn(50, { from: sender })

    const balance = await Token_V1.at(proxyAddress).balanceOf(sender)
    assert(balance.eq(50))

    const totalSupply = await Token_V1.at(proxyAddress).totalSupply()
    assert(totalSupply.eq(50))
  })

})
