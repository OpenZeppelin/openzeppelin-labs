const Token_V0 = artifacts.require('Token_V0')
const Token_V1 = artifacts.require('Token_V1')
const encodeCall = require('./helpers/encodeCall')
const assertRevert = require('./helpers/assertRevert')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')

contract('OwnedUpgradeabilityProxy', ([_, proxyOwner, tokenOwner, anotherAccount]) => {
  let proxy
  let impl_v0
  let impl_v1
  let token_v0
  let token_v1
  const initializeData = encodeCall('initialize', ['address'], [tokenOwner]);

  beforeEach(async function () {
    proxy = await OwnedUpgradeabilityProxy.new({ from: proxyOwner })
    impl_v0 = await Token_V0.new()
    impl_v1 = await Token_V1.new()
    token_v0 = Token_V0.at(proxy.address)
    token_v1 = Token_V1.at(proxy.address)
  })

  describe('owner', function () {
    it('has an owner', async function () {
      const owner = await proxy.proxyOwner()

      assert.equal(owner, proxyOwner)
    })
  })

  describe('transferOwnership', function () {
    describe('when the new proposed owner is not the zero address', function () {
      const newOwner = anotherAccount

      describe('when the sender is the owner', function () {
        const from = proxyOwner

        it('transfers the ownership', async function () {
          await proxy.transferProxyOwnership(newOwner, { from })

          const owner = await proxy.proxyOwner()
          assert.equal(owner, newOwner)
        })

        it('emits an event', async function () {
          const { logs } = await proxy.transferProxyOwnership(newOwner, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'ProxyOwnershipTransferred')
          assert.equal(logs[0].args.previousOwner, proxyOwner)
          assert.equal(logs[0].args.newOwner, newOwner)
        })
      })

      describe('when the sender is the token owner', function () {
        const from = tokenOwner

        beforeEach(async () => await proxy.upgradeToAndCall(impl_v1.address, initializeData, { from: proxyOwner }))

        it('reverts', async function () {
          await assertRevert(proxy.transferProxyOwnership(newOwner, { from }))
        })
      })

      describe('when the sender is not the owner', function () {
        const from = anotherAccount

        it('reverts', async function () {
          await assertRevert(proxy.transferProxyOwnership(newOwner, { from }))
        })
      })
    })

    describe('when the new proposed owner is the zero address', function () {
      const newOwner = 0x0

      it('reverts', async function () {
        await assertRevert(proxy.transferProxyOwnership(newOwner, { from: proxyOwner }))
      })
    })
  })

  describe('implementation', function () {
    describe('when no initial implementation was provided', function () {
      it('zero address is returned', async function () {
        const implementation = await proxy.implementation()
        assert.equal(implementation, 0x0)
      })
    })

    describe('when an initial implementation was provided', function () {
      beforeEach(async () => await proxy.upgradeTo(impl_v0.address, { from: proxyOwner }))

      it('returns the given implementation', async function () {
        const implementation = await proxy.implementation()
        assert.equal(implementation, impl_v0.address)
      })
    })
  })

  describe('upgrade', function () {
    describe('when the new implementation is not the zero address', function () {

      describe('when the sender is the proxy owner', function () {
        const from = proxyOwner;

        describe('when no initial implementation was provided', function () {
          it('upgrades to the given implementation', async function () {
            await proxy.upgradeTo(impl_v0.address, { from: proxyOwner })

            const implementation = await proxy.implementation();
            assert.equal(implementation, impl_v0.address);
          })
        })

        describe('when an initial implementation was provided', function () {
          beforeEach(async () => await proxy.upgradeTo(impl_v0.address, { from }))

          describe('when the given implementation is equal to the current one', function () {
            it('reverts', async function () {
              await assertRevert(proxy.upgradeTo(impl_v0.address, { from }))
            })
          })

          describe('when the given implementation is different than the current one', function () {
            it('upgrades to the new implementation', async function () {
              await proxy.upgradeTo(impl_v1.address, { from })

              const implementation = await proxy.implementation();
              assert.equal(implementation, impl_v1.address);
            })
          })
        })
      })

      describe('when the sender is not the proxy owner', function () {
        const from = anotherAccount;

        it('reverts', async function () {
          await assertRevert(proxy.upgradeTo(impl_v0.address, { from }))
        })
      })
    })

    describe('when the new implementation is the zero address', function () {
      it('reverts', async function () {
        await assertRevert(proxy.upgradeTo(0x0, { from: proxyOwner }))
      })
    })
  })

  describe('upgrade and call', function () {

    describe('when the new implementation is not the zero address', function () {

      describe('when the sender is the proxy owner', function () {
        const from = proxyOwner;

        it('upgrades to the given implementation', async function () {
          await proxy.upgradeToAndCall(impl_v0.address, initializeData, { from })

          const implementation = await proxy.implementation();
          assert.equal(implementation, impl_v0.address);
        })

        it('calls the implementation using the given data as msg.data', async function () {
          await proxy.upgradeToAndCall(impl_v0.address, initializeData, { from })

          const owner = await token_v0.owner()
          assert.equal(owner, tokenOwner);

          await assertRevert(token_v0.mint(anotherAccount, 100, { from: anotherAccount }))
          await token_v0.mint(anotherAccount, 100, { from: tokenOwner })

          const balance = await token_v0.balanceOf(anotherAccount)
          assert(balance.eq(100))
        })
      })

      describe('when the sender is not the proxy owner', function () {
        const from = anotherAccount;

        it('reverts', async function () {
          await assertRevert(proxy.upgradeToAndCall(impl_v0.address, initializeData, { from }))
        })
      })
    })

    describe('when the new implementation is the zero address', function () {
      it('reverts', async function () {
        await assertRevert(proxy.upgradeToAndCall(0x0, initializeData, { from: proxyOwner }))
      })
    })
  })

  describe('delegatecall', function () {
    describe('when no implementation was given', function () {
      it('reverts', async function () {
        await assertRevert(token_v0.totalSupply());
      })
    })

    describe('when an initial implementation was given', function () {
      const sender = anotherAccount

      beforeEach(async () => await proxy.upgradeToAndCall(impl_v0.address, initializeData, { from: proxyOwner }))

      describe('when there were no further upgrades', function () {

        it('delegates calls to the initial implementation', async function() {
          await token_v0.mint(sender, 100, { from: tokenOwner })

          const balance = await token_v0.balanceOf(sender)
          assert(balance.eq(100))

          const totalSupply = await token_v0.totalSupply()
          assert(totalSupply.eq(100))
        })

        it('fails when trying to call an unknown function of the current implementation', async function () {
          await token_v0.mint(sender, 100, { from: tokenOwner })

          await assertRevert(token_v1.burn(20, { from: tokenOwner }))
        })
      })

      describe('when there was another upgrade', function () {
        beforeEach(async () => {
          await token_v0.mint(sender, 100, { from: tokenOwner })
          await proxy.upgradeTo(impl_v1.address, { from: proxyOwner })
        })

        it('delegates calls to the last upgraded implementation', async function() {
          await token_v1.mint(sender, 20, { from: tokenOwner })
          await assertRevert(token_v1.mint(sender, 20, { from: sender }))
          await token_v1.burn(40, { from: sender })

          const balance = await token_v1.balanceOf(sender)
          assert(balance.eq(80))

          const totalSupply = await token_v1.totalSupply()
          assert(totalSupply.eq(80))
        })
      })
    })
  })
})
