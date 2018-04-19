'use strict';

const abi = require('ethereumjs-abi');

var LegacyToken = artifacts.require('./LegacyToken.sol')
const ManagedMigrationToken = artifacts.require('ManagedMigrationToken')
const OwnedUpgradeabilityProxy = artifacts.require('zos-upgradeability/contracts/upgradeability/OwnedUpgradeabilityProxy.sol')


contract('LegacyToken migration', function (accounts) {
  var legacyToken, newToken, holders;

  const owner = accounts[9];


  before(async function () {
    
    //Deploy LegacyToken and mint tokens
    legacyToken = await LegacyToken.new();
    holders = [];
    for(var i = 1; i < 5; i++) {
      holders.push(accounts[i])
      await legacyToken.mint(accounts[i], i * 10)
    }

    //Deploy new upgradeable token
    const proxy = await OwnedUpgradeabilityProxy.new()
    const migration = await ManagedMigrationToken.new()
    const methodId = abi.methodID('initialize', ['address', 'address']).toString('hex')
    const params = abi.rawEncode(['address','address'],
      [owner, legacyToken.address]).toString('hex')
    const initializeData = '0x' + methodId + params
    await proxy.upgradeToAndCall(migration.address, initializeData)

    newToken = await ManagedMigrationToken.at(proxy.address)
  });

  it('maintains correct balances after migrating', async function () {
    await newToken.migrateBalances(holders, {from: owner})
    for(var i = 1; i < 5; i++) {
      let origBalance = await legacyToken.balanceOf(accounts[i]);
      let newTokenBalance = await newToken.balanceOf(accounts[i]);
      assert(origBalance.eq(newTokenBalance));
    }
  });

  it('total supply of the old token and new token should be equal', async function() {
    let totalSupplyLegacy = await legacyToken.totalSupply();
    let totalSupplyUpgraded = await newToken.totalSupply();
    assert(totalSupplyLegacy.eq(totalSupplyUpgraded));
  })

});
