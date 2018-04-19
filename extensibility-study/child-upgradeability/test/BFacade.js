'use strict'

const encodeCall = require('./helpers/encodeCall')
const assertRevert = require('./helpers/assertRevert')
const ExtensibilityProxy = artifacts.require('ExtensibilityProxy')
const A = artifacts.require('A')
const B = artifacts.require('B')
const BFacade = artifacts.require('BFacade')
const A_v2 = artifacts.require('A_v2')
const B_Av2 = artifacts.require('B_Av2')
const B_v2 = artifacts.require('B_v2')
const B_v2Facade = artifacts.require('B_v2Facade')


contract('BFacade', ([_, proxyOwner, contractOwner, anotherAccount, implementation_v0, implementation_v2]) => {
  
  describe('extensibility proxy', function () {  
    const from = proxyOwner
    const value = 1e5

    beforeEach(async function () {
      this.behavior = await A.new({from})
      this.bfacade = await BFacade.new({from})
      this.proxy = await ExtensibilityProxy.new({from})
      
      await this.proxy.upgradeFacadeTo(this.bfacade.address, {from})
      const initializeData = encodeCall('initialize', ['uint256'], [42], {from})
      await this.proxy.upgradeToAndCall(this.behavior.address, initializeData, {from, value})
      
      this.b = await B.at(this.proxy.address, {from})
    })

    it('gets facade address right', async function () {
      const facadeAddress = await this.proxy.facadeImplementation({from: anotherAccount})
      assert.equal(facadeAddress, this.bfacade.address)
    })

    it('gets behavior address right', async function () {
      const proxyAddress = await this.proxy.implementation({from: proxyOwner})
      assert.equal(proxyAddress, this.behavior.address)
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

    describe('parent upgradeability', function () {

      beforeEach(async function () {
        this.behavior_v2 = await A_v2.new({from})
        await this.proxy.upgradeTo(this.behavior_v2.address, { from })
      })
      
      it('allows new methods through A_v2', async function() {
        const a_v2 = await A_v2.at(this.proxy.address);
        const double = await a_v2.getDoublex();
        assert.equal(double, 84)
      })

      it('allows new methods through B_Av2', async function() {
        const b_Av2 = await B_Av2.at(this.proxy.address);
        const double = await b_Av2.getDoublex();
        assert.equal(double, 84)
      })

      it('transparently allows changes in methods', async function () {
        await this.b.setx(13)
        const x = await this.b.x()
        assert.equal(x, 1300)
      })

    })

    describe('child upgradeability', function () {

      beforeEach(async function () {
        await this.b.setx(5)
        await this.b.sety(6)
        this.bv2facade = await B_v2Facade.new({from})
        this.proxy.upgradeFacadeTo(this.bv2facade.address, {from})
        this.b_v2 = await B_v2.at(this.proxy.address, {from})
      })

      it('preserves behavior storage', async function() {
        const x = await this.b_v2.x()
        assert.equal(x, 5)
      })

      it('preserves facade storage', async function() {
        const y = await this.b_v2.y()
        assert.equal(y, 6)
      })

      it('knows new functionality', async function () {
        const mult = await this.b_v2.mult()
        assert.equal(mult, 30)
      })

    })
  })
})
