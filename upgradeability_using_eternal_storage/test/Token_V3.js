const abi = require('ethereumjs-abi')
const Token_V0 = artifacts.require('Token_V0')
const Token_V1 = artifacts.require('Token_V1')
const Token_V2 = artifacts.require('Token_V2')
const Token_V3 = artifacts.require('Token_V3')
const EternalStorageProxy = artifacts.require('EternalStorageProxy')
const assertRevert = require('./helpers/assertRevert')
const shouldBehaveLikeTokenV0 = require('./behaviors/token_v0')
const shouldBehaveLikeTokenV1 = require('./behaviors/token_v1')
const shouldBehaveLikeTokenV2 = require('./behaviors/token_v2')

contract('Token_V3', ([_, proxyOwner, tokenOwner, owner, recipient, anotherAccount]) => {

  beforeEach(async function () {
    const proxy = await EternalStorageProxy.new({ from: proxyOwner })

    const impl_v0 = await Token_V0.new()
    await proxy.upgradeTo('0', impl_v0.address, { from: proxyOwner })

    const impl_v1 = await Token_V1.new()
    const methodId = abi.methodID('initialize', ['address']).toString('hex')
    const params = abi.rawEncode(['address'], [tokenOwner]).toString('hex')
    const initializeData = '0x' + methodId + params
    await proxy.upgradeToAndCall('1', impl_v1.address, initializeData, { from: proxyOwner })

    const impl_v2 = await Token_V2.new()
    await proxy.upgradeTo('2', impl_v2.address, { from: proxyOwner })

    const impl_v3 = await Token_V3.new()
    await proxy.upgradeTo('3', impl_v3.address, { from: proxyOwner })

    this.token = await Token_V3.at(proxy.address)
  })

  shouldBehaveLikeTokenV0(tokenOwner, owner, recipient, anotherAccount)

  shouldBehaveLikeTokenV1(proxyOwner, tokenOwner, owner, anotherAccount)

  shouldBehaveLikeTokenV2(tokenOwner, owner)

  describe('pause', function () {
    describe('when the sender is the token owner', function () {
      const from = tokenOwner

      describe('when the token is unpaused', function () {
        it('pauses the token', async function () {
          await this.token.pause({ from })

          const paused = await this.token.paused()
          assert.equal(paused, true)
        })

        it('emits a paused event', async function () {
          const { logs } = await this.token.pause({ from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Pause')
        })
      })

      describe('when the token is paused', function () {
        beforeEach(async function () {
          await this.token.pause({ from })
        })

        it('reverts', async function () {
          await assertRevert(this.token.pause({ from }))
        })
      })
    })

    describe('when the sender is not the token owner', function () {
      const from = anotherAccount

      it('reverts', async function () {
        await assertRevert(this.token.pause({ from }))
      })
    })
  })

  describe('unpause', function () {
    describe('when the sender is the token owner', function () {
      const from = tokenOwner

      describe('when the token is paused', function () {
        beforeEach(async function () {
          await this.token.pause({ from })
        })

        it('unpauses the token', async function () {
          await this.token.unpause({ from })

          const paused = await this.token.paused()
          assert.equal(paused, false)
        })

        it('emits an unpaused event', async function () {
          const { logs } = await this.token.unpause({ from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Unpause')
        })
      })

      describe('when the token is unpaused', function () {
        it('reverts', async function () {
          await assertRevert(this.token.unpause({ from }))
        })
      })
    })

    describe('when the sender is not the token owner', function () {
      const from = anotherAccount

      it('reverts', async function () {
        await assertRevert(this.token.unpause({ from }))
      })
    })
  })

  describe('pausable token', function () {
    const from = tokenOwner
    
    describe('paused', function () {
      it('is not paused by default', async function () {
        const paused = await this.token.paused({ from })
  
        assert.equal(paused, false)
      })
  
      it('is paused after being paused', async function () {
        await this.token.pause({ from })
        const paused = await this.token.paused({ from })
  
        assert.equal(paused, true)
      })
  
      it('is not paused after being paused and then unpaused', async function () {
        await this.token.pause({ from })
        await this.token.unpause({ from })
        const paused = await this.token.paused()
  
        assert.equal(paused, false)
      })
    })
    
    describe('transfer', function () {
      beforeEach(async function () {
        await this.token.mint(owner, 100, { from: tokenOwner })
      })
      
      it('allows to transfer when unpaused', async function () {
        await this.token.transfer(recipient, 100, { from: owner })
        
        const senderBalance = await this.token.balanceOf(owner)
        assert.equal(senderBalance, 0)
  
        const recipientBalance = await this.token.balanceOf(recipient)
        assert.equal(recipientBalance, 100)
      })
  
      it('allows to transfer when paused and then unpaused', async function () {
        await this.token.pause({ from: tokenOwner })
        await this.token.unpause({ from: tokenOwner })
        
        await this.token.transfer(recipient, 100, { from: owner })

        const senderBalance = await this.token.balanceOf(owner)
        assert.equal(senderBalance, 0)

        const recipientBalance = await this.token.balanceOf(recipient)
        assert.equal(recipientBalance, 100)
      })
  
      it('reverts when trying to transfer when paused', async function () {
        await this.token.pause({ from: tokenOwner })
        
        await assertRevert(this.token.transfer(recipient, 100, { from: owner }))
      })
    })

    describe('approve', function () {
      it('allows to approve when unpaused', async function () {
        await this.token.approve(anotherAccount, 40, { from: owner })

        const allowance = await this.token.allowance(owner, anotherAccount)
        assert.equal(allowance, 40)
      })

      it('allows to transfer when paused and then unpaused', async function () {
        await this.token.pause({ from: tokenOwner })
        await this.token.unpause({ from: tokenOwner })

        await this.token.approve(anotherAccount, 40, { from: owner })

        const allowance = await this.token.allowance(owner, anotherAccount)
        assert.equal(allowance, 40)
      })

      it('reverts when trying to transfer when paused', async function () {
        await this.token.pause({ from: tokenOwner })

        await assertRevert(this.token.approve(anotherAccount, 40, { from: owner }))
      })
    })

    describe('transfer from', function () {
      beforeEach(async function () {
        await this.token.mint(owner, 100, { from: tokenOwner })
        await this.token.approve(anotherAccount, 50, { from: owner })
      })

      it('allows to transfer from when unpaused', async function () {
        await this.token.transferFrom(owner, recipient, 40, { from: anotherAccount })

        const senderBalance = await this.token.balanceOf(owner)
        assert.equal(senderBalance, 60)

        const recipientBalance = await this.token.balanceOf(recipient)
        assert.equal(recipientBalance, 40)
      })

      it('allows to transfer when paused and then unpaused', async function () {
        await this.token.pause({ from: tokenOwner })
        await this.token.unpause({ from: tokenOwner })

        await this.token.transferFrom(owner, recipient, 40, { from: anotherAccount })

        const senderBalance = await this.token.balanceOf(owner)
        assert.equal(senderBalance, 60)

        const recipientBalance = await this.token.balanceOf(recipient)
        assert.equal(recipientBalance, 40)
      })

      it('reverts when trying to transfer from when paused', async function () {
        await this.token.pause({ from: tokenOwner })

        await assertRevert(this.token.transferFrom(owner, recipient, 40, { from: anotherAccount }))
      })
    })

    describe('decrease approval', function () {
      beforeEach(async function () {
        await this.token.approve(anotherAccount, 100, { from: owner })
      })

      it('allows to decrease approval when unpaused', async function () {
        await this.token.decreaseApproval(anotherAccount, 40, { from: owner })

        const allowance = await this.token.allowance(owner, anotherAccount)
        assert.equal(allowance, 60)
      })

      it('allows to decrease approval when paused and then unpaused', async function () {
        await this.token.pause({ from: tokenOwner })
        await this.token.unpause({ from: tokenOwner })

        await this.token.decreaseApproval(anotherAccount, 40, { from: owner })

        const allowance = await this.token.allowance(owner, anotherAccount)
        assert.equal(allowance, 60)
      })

      it('reverts when trying to transfer when paused', async function () {
        await this.token.pause({ from: tokenOwner })

        await assertRevert(this.token.decreaseApproval(anotherAccount, 40, { from: owner }))
      })
    })

    describe('increase approval', function () {
      beforeEach(async function () {
        await this.token.approve(anotherAccount, 100, { from: owner })
      })

      it('allows to increase approval when unpaused', async function () {
        await this.token.increaseApproval(anotherAccount, 40, { from: owner })

        const allowance = await this.token.allowance(owner, anotherAccount)
        assert.equal(allowance, 140)
      })

      it('allows to increase approval when paused and then unpaused', async function () {
        await this.token.pause({ from: tokenOwner })
        await this.token.unpause({ from: tokenOwner })

        await this.token.increaseApproval(anotherAccount, 40, { from: owner })

        const allowance = await this.token.allowance(owner, anotherAccount)
        assert.equal(allowance, 140)
      })

      it('reverts when trying to increase approval when paused', async function () {
        await this.token.pause({ from: tokenOwner })

        await assertRevert(this.token.increaseApproval(anotherAccount, 40, { from: owner }))
      })
    })
  })
})
