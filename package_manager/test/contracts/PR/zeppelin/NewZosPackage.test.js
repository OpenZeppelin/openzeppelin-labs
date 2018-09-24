import assertRevert from '../../../helpers/assertRevert'
import shouldBehaveLikeRepoPackage from "../RepoPackage.behaviour";

const Package = artifacts.require('NewZosPackage')
const DummyImplementation = artifacts.require('DummyImplementation')
const ImplementationDirectory = artifacts.require('ImplementationDirectory')
const shouldBehaveLikeOwnable = require('zos-lib').behaviors.shouldBehaveLikeOwnable

contract('NewZosPackage', accounts => {
  const [_, owner, anotherAddress] = accounts
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  before('deploy dummy implementation', async function () {
    this.implementation = (await DummyImplementation.new()).address
  })

  beforeEach('deploy package with directories', async function () {
    this.package = await Package.new({ from: owner })
    this.directory_V0 = await ImplementationDirectory.new({ from: owner })
    this.directory_V1 = await ImplementationDirectory.new({ from: owner })
  })

  describe('ownership', function () {
    beforeEach(function () {
      this.ownable = this.package
    })

    shouldBehaveLikeOwnable(owner, anotherAddress)
  })

  describe('repo package', function () {
    beforeEach('deploy aragon repo', async function () {
      this.repoPackage = await Package.new()
    })

    shouldBehaveLikeRepoPackage(accounts)
  })

  describe('addVersion', function () {
    const version = [1,0,0]

    describe('when the sender is the owner of the contract', function () {
      const from = owner

      describe('when the given version was not set', function () {
        it('registers given implementation directory', async function () {
          await this.package.addVersion(version, this.directory_V0.address, { from })

          const registeredDirectory = await this.package.getVersion(version)
          assert.equal(registeredDirectory, this.directory_V0.address)
        })

        it('emits two events', async function () {
          const { logs } = await this.package.addVersion(version, this.directory_V0.address, { from })

          assert.equal(logs.length, 2)

          assert.equal(logs[0].event, 'NewVersion')
          assert.equal(logs[0].args.versionId, 1)
          assert.notStrictEqual(logs[0].args.semanticVersion, version)

          assert.equal(logs[1].event, 'VersionAdded')
          assert.equal(logs[1].args.provider, this.directory_V0.address)
          assert.notStrictEqual(logs[1].args.version, version)
        })
      })

      describe('when the given version was already set', function () {
        const anotherVersion = [2,0,0]

        beforeEach('registering previous version', async function () {
          await this.package.addVersion(version, this.directory_V0.address, { from })
        })

        it('reverts', async function () {
          await assertRevert(this.package.addVersion(version, this.directory_V1.address, { from }))
        })

        it('can register another version', async function () {
          await this.package.addVersion(anotherVersion, this.directory_V1.address, { from })

          const newRegisteredDirectory = await this.package.getVersion(anotherVersion)
          assert.equal(newRegisteredDirectory, this.directory_V1.address)
        })

        it('emits two more events', async function () {
          const { logs } = await this.package.addVersion(anotherVersion, this.directory_V1.address, { from })

          assert.equal(logs.length, 2)

          assert.equal(logs[0].event, 'NewVersion')
          assert.equal(logs[0].args.versionId, 2)
          assert.notStrictEqual(logs[0].args.semanticVersion, anotherVersion)

          assert.equal(logs[1].event, 'VersionAdded')
          assert.equal(logs[1].args.provider, this.directory_V1.address)
          assert.notStrictEqual(logs[1].args.version, version)
        })
      })
    })

    describe('when the sender is not the owner of the contract', function () {
      const from = anotherAddress

      it('reverts', async function () {
        await assertRevert(this.package.addVersion(version, this.directory_V0.address, { from }))
      })
    })
  })

  describe('getVersion', function () {
    const version = [1,0,0]

    describe('when the requested version was set', function () {
      beforeEach(async function () {
        await this.package.addVersion(version, this.directory_V0.address, { from: owner })
      })

      it('returns the registered directory', async function () {
        const registeredDirectory = await this.package.getVersion(version)
        assert.equal(registeredDirectory, this.directory_V0.address)
      })
    })

    describe('when the requested version was not set', function () {
      it('returns the zero address', async function () {
        const registeredDirectory = await this.package.getVersion(version)
        assert.equal(registeredDirectory, ZERO_ADDRESS)
      })
    })
  })

  describe('hasVersion', function () {
    const version = [1,0,0]

    describe('when the requested version was set', function () {
      beforeEach(async function () {
        await this.package.addVersion(version, this.directory_V0.address, { from: owner })
      })

      it('returns true', async function () {
        const hasVersion = await this.package.hasVersion(version)
        assert.isTrue(hasVersion)
      })
    })

    describe('when the requested version was not set', function () {
      it('returns the zero address', async function () {
        const hasVersion = await this.package.hasVersion(version)
        assert.isFalse(hasVersion)
      })
    })
  })

  describe('getImplementation', function () {
    const version = [1,0,0]
    const contractName = 'ERC721'

    describe('when the requested version was set', function () {
      beforeEach(async function () {
        await this.package.addVersion(version, this.directory_V0.address, { from: owner })
      })

      describe('when the requested version holds the requested contract name', function () {
        beforeEach(async function () {
          await this.directory_V0.setImplementation(contractName, this.implementation, { from: owner })
        })

        it('returns the requested implementation', async function () {
          const implementation = await this.package.getImplementation(version, contractName)
          assert.equal(implementation, this.implementation)
        })
      })

      describe('when the requested version does not hold the requested contract name', function () {
        it('returns the zero address', async function () {
          const implementation = await this.package.getImplementation(version, contractName)
          assert.equal(implementation, ZERO_ADDRESS)
        })
      })
    })

    describe('when the requested version was not set', function () {
      it('reverts', async function () {
        await assertRevert(this.package.getImplementation(version, contractName))
      })
    })
  })
})
