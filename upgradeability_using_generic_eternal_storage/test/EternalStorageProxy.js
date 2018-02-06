const abi = require('ethereumjs-abi');
const assertRevert = require('./helpers/assertRevert')

const Token_V0 = artifacts.require('Token_V0')
const Token_V1 = artifacts.require('Token_V1')
const EternalStorageProxy = artifacts.require('EternalStorageProxy')

contract('EternalStorageProxy', ([_, proxyOwner, tokenOwner, anotherAccount]) => {
  let proxy
  let impl_v0
  let impl_v1
  let token_v0
  let token_v1

  const methodId = abi.methodID('initialize', ['address']).toString('hex');
  const params = abi.rawEncode(['address'], [tokenOwner]).toString('hex');
  const initializeData = '0x' + methodId + params;

  beforeEach(async function () {
    proxy = await EternalStorageProxy.new({ from: proxyOwner })
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

        beforeEach(async () => await proxy.upgradeToAndCall('1', impl_v1.address, initializeData, { from: proxyOwner }))

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

  describe('version and implementation', function () {
    describe('when no initial version was provided', function () {
      it('non version and the zero address are returned', async function () {
        const version = await proxy.version();
        const implementation = await proxy.implementation()

        assert.equal(version, '');
        assert.equal(implementation, 0x0)
      })
    })

    describe('when an initial version was provided', function () {
      beforeEach(async () => await proxy.upgradeTo('version_0', impl_v0.address, { from: proxyOwner }))

      it('returns the new version and implementation', async function () {
        const version = await proxy.version();
        const implementation = await proxy.implementation()

        assert.equal(version, 'version_0');
        assert.equal(implementation, impl_v0.address)
      })
    })
  })

  describe('upgrade', function () {
    describe('when the new implementation is not the zero address', function () {

      describe('when the sender is the proxy owner', function () {
        const from = proxyOwner;

        describe('when no initial version was provided', function () {
          it('upgrades to the given version', async function () {
            await proxy.upgradeTo('0', impl_v0.address, { from })

            const version = await proxy.version();
            assert.equal(version, '0');

            const implementation = await proxy.implementation();
            assert.equal(implementation, impl_v0.address);
          })
        })

        describe('when an initial version was provided', function () {
          beforeEach(async () => await proxy.upgradeTo('0', impl_v0.address, { from }))

          describe('when the given implementation is equal to the current one', function () {
            it('reverts', async function () {
              await assertRevert(proxy.upgradeTo('0.0', impl_v0.address, { from }))
            })
          })

          describe('when the given implementation is different than the current one', function () {
            it('upgrades to the new version', async function () {
              await proxy.upgradeTo('1', impl_v1.address, { from })

              const version = await proxy.version();
              assert.equal(version, '1');

              const implementation = await proxy.implementation();
              assert.equal(implementation, impl_v1.address);
            })
          })
        })
      })

      describe('when the sender is not the proxy owner', function () {
        const from = anotherAccount;

        it('reverts', async function () {
          await assertRevert(proxy.upgradeTo('0', impl_v0.address, { from }))
        })
      })
    })

    describe('when the new implementation is the zero address', function () {
      it('reverts', async function () {
        await assertRevert(proxy.upgradeTo('0', 0x0, { from: proxyOwner }))
      })
    })
  })

  describe('upgrade and call', function () {

    describe('when the new implementation is not the zero address', function () {

      describe('when the sender is the proxy owner', function () {
        const from = proxyOwner;

        it('upgrades to the given version', async function () {
          await proxy.upgradeToAndCall('1', impl_v1.address, initializeData, { from })

          const version = await proxy.version();
          assert.equal(version, '1');

          const implementation = await proxy.implementation();
          assert.equal(implementation, impl_v1.address);
        })

        it('calls the implementation using the given data as msg.data', async function () {
          await proxy.upgradeToAndCall('1', impl_v1.address, initializeData, { from })

          const owner = await token_v1.owner()
          assert.equal(owner, tokenOwner);

          await assertRevert(token_v1.mint(anotherAccount, 100, { from: anotherAccount }))
          await token_v1.mint(anotherAccount, 100, { from: tokenOwner })

          const balance = await token_v1.balanceOf(anotherAccount)
          assert(balance.eq(100))
        })
      })

      describe('when the sender is not the proxy owner', function () {
        const from = anotherAccount;

        it('reverts', async function () {
          await assertRevert(proxy.upgradeToAndCall('0', impl_v1.address, initializeData, { from }))
        })
      })
    })

    describe('when the new implementation is the zero address', function () {
      it('reverts', async function () {
        await assertRevert(proxy.upgradeToAndCall('0', 0x0, initializeData, { from: proxyOwner }))
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

      beforeEach(async () => await proxy.upgradeTo('0', impl_v0.address, { from: proxyOwner }))

      describe('when there were no further upgrades', function () {

        it('delegates calls to the initial implementation', async function() {
          await token_v0.mint(sender, 100)

          const balance = await token_v0.balanceOf(sender)
          assert(balance.eq(100))

          const totalSupply = await token_v0.totalSupply()
          assert(totalSupply.eq(100))
        })

        it('fails when trying to call an unknown function of the current implementation', async function () {
          await token_v0.mint(sender, 100)

          await assertRevert(token_v1.mintingFinished())
        })
      })

      describe('when there was another upgrade', function () {
        beforeEach(async () => {
          await token_v0.mint(sender, 100)
          await proxy.upgradeToAndCall('1', impl_v1.address, initializeData, { from: proxyOwner })
        })

        it('delegates calls to the last upgraded implementation', async function() {
          await token_v1.mint(sender, 20, { from: tokenOwner })
          await assertRevert(token_v1.mint(sender, 20, { from: sender }))

          const balance = await token_v1.balanceOf(sender)
          assert(balance.eq(120))

          const totalSupply = await token_v1.totalSupply()
          assert(totalSupply.eq(120))
        })
      })
    })
  })
})
