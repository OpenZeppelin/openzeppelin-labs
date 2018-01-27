const assertRevert = require('../../helpers/assertRevert')
const OwnedUpgradeabilityProxy = artifacts.require('GES_OwnedUpgradeabilityProxy')

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

  describe('transferOwnership', function () {
    describe('when the new proposed owner is not the zero address', function () {
      const newOwner = anotherAccount

      describe('when the sender is the owner', function () {
        const from = owner

        it('transfers the ownership', async function () {
          await ownedUpgradeabilityToken.transferOwnership(newOwner, { from })

          const proxyOwner = await ownedUpgradeabilityToken.proxyOwner()
          assert.equal(proxyOwner, anotherAccount)
        })
      })

      describe('when the sender is not the owner', function () {
        const from = anotherAccount

        it('reverts', async function () {
          await assertRevert(ownedUpgradeabilityToken.transferOwnership(newOwner, { from }))
        })
      })
    })

    describe('when the new proposed owner is the zero address', function () {
      const newOwner = 0x0

      it('reverts', async function () {
        await assertRevert(ownedUpgradeabilityToken.transferOwnership(newOwner, { from: owner }))
      })
    })
  })
})
