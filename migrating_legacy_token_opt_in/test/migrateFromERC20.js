'use strict';

const abi = require('ethereumjs-abi');

var LegacyToken = artifacts.require('./LegacyToken.sol')
const BurnContract = artifacts.require('./BurnContract.sol')
const MigrationToken = artifacts.require('MigrationToken')
const OwnedUpgradeabilityProxy = artifacts.require('zos-upgradeability/contracts/upgradeability/OwnedUpgradeabilityProxy.sol')


contract('LegacyToken migration', function (accounts) {
  var legacyToken, newToken, burnContract;


  before(async function () {
    burnContract = await BurnContract.new();
    //Deploy LegacyToken and mint tokens
    legacyToken = await LegacyToken.new();
    for(var i = 1; i < 5; i++) {
      await legacyToken.mint(accounts[i], i * 10);
    }

    //Deploy new upgradeable token
    const proxy = await OwnedUpgradeabilityProxy.new();
    const migration = await MigrationToken.new()
    const methodId = abi.methodID('initialize', ['address', 'address']).toString('hex')
    const params = abi.rawEncode(['address', 'address'],
      [legacyToken.address, burnContract.address])
      .toString('hex')
    const initializeData = '0x' + methodId + params
    await proxy.upgradeToAndCall(migration.address, initializeData)

    newToken = await MigrationToken.at(proxy.address)
  });

  it('maintains correct balances after calling migrateToken', async function () {
    for(var i = 1; i < 5; i++) {
      let origBalance = await legacyToken.balanceOf(accounts[i]);
      await legacyToken.approve(newToken.address, origBalance, {from: accounts[i]});
      await newToken.migrateToken(origBalance, {from: accounts[i]});
      let origBalanceAfter = await legacyToken.balanceOf(accounts[i]);
      assert(origBalanceAfter.eq(0));
      let newTokenBalance = await newToken.balanceOf(accounts[i]);
      assert(origBalance.eq(newTokenBalance));
    }
  });

  it('total supply of the old token, new token, and burnContract\'s balance in the old token should be equal', async function() {
    let totalSupplyLegacy = await legacyToken.totalSupply();
    let totalSupplyUpgraded = await newToken.totalSupply();
    let balanceOfBurnContract = await legacyToken.balanceOf(burnContract.address);
    assert(totalSupplyLegacy.eq(totalSupplyUpgraded));
    assert(totalSupplyUpgraded.eq(balanceOfBurnContract));
  })


  it('maintains correct balances after calling migrateTokenTo', async function() {
    await legacyToken.mint(accounts[0], 100);
    await legacyToken.mint(accounts[5], 100);
    let migratorBalanceOldBefore = await legacyToken.balanceOf(accounts[0]);
    let recieverBalanceOldBefore = await legacyToken.balanceOf(accounts[5]);
    await legacyToken.approve(newToken.address, migratorBalanceOldBefore, {from: accounts[0]});
    await newToken.migrateTokenTo(migratorBalanceOldBefore, accounts[5], {from: accounts[0]});
    let migratorBalanceOldAfter = await legacyToken.balanceOf(accounts[0]);
    let recieverBalanceOldAfter = await legacyToken.balanceOf(accounts[5]);
    let migratorBalanceNew = await newToken.balanceOf(accounts[0]);
    let recieverBalanceNew = await newToken.balanceOf(accounts[5]);
    assert(recieverBalanceOldBefore.eq(recieverBalanceOldAfter));
    assert(migratorBalanceOldAfter.eq(0));
    assert(migratorBalanceNew.eq(0));
    assert(recieverBalanceNew.eq(migratorBalanceOldBefore));
  })

});
