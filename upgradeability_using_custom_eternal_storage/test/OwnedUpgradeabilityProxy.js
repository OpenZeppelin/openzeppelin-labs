const assertRevert = require('./helpers/assertRevert')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')

contract('OwnedUpgradeabilityProxy', ([owner, anotherAccount]) => {
  let ownedUpgradeabilityToken

  beforeEach(async function () {
    ownedUpgradeabilityToken = await OwnedUpgradeabilityProxy.new({ from: owner })
  })

  describe('owner', function () {
    it('has an owner', async function () {
      const proxyOwner = await ownedUpgradeabilityToken.proxyOwner()

      assert.equal(proxyOwner, owner)
    })
  })

  describe('transfer ownership', function () {
    describe('when the new proposed owner is not the zero address', function () {
      const newOwner = anotherAccount

      describe('when the sender is the owner', function () {
        const from = owner

        it('transfers the ownership', async function () {
          await ownedUpgradeabilityToken.transferProxyOwnership(newOwner, { from })

          const proxyOwner = await ownedUpgradeabilityToken.proxyOwner()
          assert.equal(proxyOwner, anotherAccount)
        })

        it('emits an event', async function () {
          const { logs } = await ownedUpgradeabilityToken.transferProxyOwnership(newOwner, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'ProxyOwnershipTransferred')
          assert.equal(logs[0].args.previousOwner, owner)
          assert.equal(logs[0].args.newOwner, newOwner)
        })
      })

      describe('when the sender is not the owner', function () {
        const from = anotherAccount

        it('reverts', async function () {
          await assertRevert(ownedUpgradeabilityToken.transferProxyOwnership(newOwner, { from }))
        })
      })
    })

    describe('when the new proposed owner is the zero address', function () {
      const newOwner = 0x0

      it('reverts', async function () {
        await assertRevert(ownedUpgradeabilityToken.transferProxyOwnership(newOwner, { from: owner }))
      })
    })
  })
})
