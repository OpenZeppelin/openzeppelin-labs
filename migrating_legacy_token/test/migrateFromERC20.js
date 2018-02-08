const abi = require('ethereumjs-abi');

var LegacyToken = artifacts.require('./LegacyToken.sol')
const BurnContract = artifacts.require('./BurnContract.sol')
const Token_V0 = artifacts.require('Token_V0')
const TokenProxy = artifacts.require('TokenProxy')


contract('LegacyToken migration', function (accounts) {
  var origToken, newToken, burnContract;


  before(async function () {
    burnContract = await BurnContract.new();
    //Deploy LegacyToken and mint tokens
    origToken = await LegacyToken.new();
    for(var i = 1; i < 5; i++) {
      await origToken.mint(accounts[i], i * 10);
    }

    //Deploy NewToken
    const proxy = await TokenProxy.new()
    const impl_v0 = await Token_V0.new()
    const methodId = abi.methodID('initialize', ['address', 'address', 'address']).toString('hex')
    const params = abi.rawEncode(['address', 'address', 'address'], [accounts[0], origToken.address, burnContract.address]).toString('hex')
    const initializeData = '0x' + methodId + params
    await proxy.upgradeToAndCall('0', impl_v0.address, initializeData)

    newToken = await Token_V0.at(proxy.address)
  });

  it('maintains correct balances after calling migrateToken', async function () {
    for(var i = 1; i < 5; i++) {
      let origBalance = await origToken.balanceOf(accounts[i]);
      await origToken.approve(newToken.address, origBalance, {from: accounts[i]});
      await newToken.migrateToken(origBalance, {from: accounts[i]});
      let origBalanceAfter = await origToken.balanceOf(accounts[i]);
      assert.equal(origBalanceAfter, 0);
      let newTokenBalance = await newToken.balanceOf(accounts[i]);
      assert.equal(origBalance.toString(), newTokenBalance.toString());
    }
  });

  it('total supply of the old token, new token, and burnContract\'s balance in the old token should be equal', async function() {
    let totalSupplyLegacy = await origToken.totalSupply();
    let totalSupplyUpgraded = await newToken.totalSupply();
    let balanceOfBurnContract = await origToken.balanceOf(burnContract.address);
    assert.equal(totalSupplyLegacy.toString(), totalSupplyUpgraded.toString());
    assert.equal(totalSupplyUpgraded.toString(), balanceOfBurnContract.toString());
  })


  it('maintains correct balances after calling migrateTokenTo', async function() {
    await origToken.mint(accounts[0], 100);
    await origToken.mint(accounts[5], 100);
    let migratorBalanceOldBefore = await origToken.balanceOf(accounts[0]);
    let recieverBalanceOldBefore = await origToken.balanceOf(accounts[5]);
    await origToken.approve(newToken.address, migratorBalanceOldBefore, {from: accounts[0]});
    await newToken.migrateTokenTo(migratorBalanceOldBefore, accounts[5], {from: accounts[0]});
    let migratorBalanceOldAfter = await origToken.balanceOf(accounts[0]);
    let recieverBalanceOldAfter = await origToken.balanceOf(accounts[5]);
    let migratorBalanceNew = await newToken.balanceOf(accounts[0]);
    let recieverBalanceNew = await newToken.balanceOf(accounts[5]);
    assert.equal(recieverBalanceOldBefore.toString(), recieverBalanceOldAfter.toString());
    assert.equal(migratorBalanceOldAfter.toString(), 0);
    assert.equal(migratorBalanceNew.toString(), 0);
    assert.equal(recieverBalanceNew.toString(), migratorBalanceOldBefore);
  })

});
