'use strict'

const encodeCall = require('./helpers/encodeCall')
const assertRevert = require('./helpers/assertRevert')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')
const UpgradeabilityProxyFactory = artifacts.require('UpgradeabilityProxyFactory')
const A = artifacts.require('A')
const B = artifacts.require('B')
const BFacade = artifacts.require('BFacade')
const A_v2 = artifacts.require('A_v2')
const B_v2 = artifacts.require('B_v2')


contract('BFacade', ([_, owner, anotherAccount, implementation_v0, implementation_v2]) => {
  const from = owner
  const value = 1e5

  beforeEach(async function () {
    this.bfacade = await BFacade.new({from})

    const initializeData = encodeCall('initialize', ['uint256'], [42], {from})
    this.behavior = await A.new({from})
    
    await this.bfacade.upgradeToAndCall(this.behavior.address, initializeData, { from, value })

    this.b = await B.at(this.bfacade.address, {from})
  })

  it('calls the "initialize" function', async function() {
    const initializable = A.at(this.b.address)
    const x = await initializable.x()
    assert.equal(x, 42)
  })

  it('recovers A storage', async function () {
    const x = await this.b.x()
    assert.equal(x, 42)
  })

  it('calls A methods', async function () {
    await this.b.setx(41)
    const x = await this.b.x()
    assert.equal(x, 41)
  })

  it('calls B methods', async function () {
    const sum = await this.b.sum()
    assert.equal(sum, 42)
  })

  it('modifies B storage', async function () {
    await this.b.sety(31)
    const sum = await this.b.sum()
    assert.equal(sum, 73)
  })

  it('modifies A storage', async function () {
    await this.b.setx(40)
    const sum = await this.b.sum()
    assert.equal(sum, 40)
  })

  describe('allows for certain upgrades to A', function () {

    beforeEach(async function () {
      this.behavior_v2 = await A_v2.new({from})
      await this.bfacade.upgradeTo(this.behavior_v2.address, { from })
    })
    
    it('allows new methods through A_v2', async function() {
      const a_v2 = await A_v2.at(this.bfacade.address);
      const double = await a_v2.getDoublex();
      assert.equal(double, 84)
    })

    it('allows new methods through B_v2', async function() {
      const b_v2 = await B_v2.at(this.bfacade.address);
      const double = await b_v2.getDoublex();
      assert.equal(double, 84)
    })

    it('transparently allows changes in methods', async function () {
      await this.b.setx(13)
      const x = await this.b.x()
      assert.equal(x, 1300)
    })


  })
   
})
