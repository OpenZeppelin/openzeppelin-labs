'use strict'

const encodeCall = require('./helpers/encodeCall')
const assertRevert = require('./helpers/assertRevert')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')
const UpgradeabilityProxyFactory = artifacts.require('UpgradeabilityProxyFactory')
const A = artifacts.require('A')
const BFacade = artifacts.require('BFacade')
const B = artifacts.require('B')


contract('BFacade', ([_, owner, anotherAccount, implementation_v0, implementation_v1]) => {
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


})
