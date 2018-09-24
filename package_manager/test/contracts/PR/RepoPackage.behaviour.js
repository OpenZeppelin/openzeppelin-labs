import assertRevert from '../../helpers/assertRevert'

export default function shouldBehaveLikeRepoPackage(accounts) {
  it('computes correct valid bumps', async function () {
    await assert.isTrue(await this.repoPackage.isValidBump([0, 0, 0], [0, 0, 1]))
    await assert.isTrue(await this.repoPackage.isValidBump([0, 0, 0], [0, 1, 0]))
    await assert.isTrue(await this.repoPackage.isValidBump([0, 0, 0], [1, 0, 0]))
    await assert.isTrue(await this.repoPackage.isValidBump([1, 4, 7], [2, 0, 0]))
    await assert.isTrue(await this.repoPackage.isValidBump([147, 4, 7], [147, 5, 0]))

    await assert.isFalse(await this.repoPackage.isValidBump([0, 0, 1], [0, 0, 1]))
    await assert.isFalse(await this.repoPackage.isValidBump([0, 1, 0], [0, 2, 1]))
    await assert.isFalse(await this.repoPackage.isValidBump([0, 0, 2], [0, 0, 1]))
    await assert.isFalse(await this.repoPackage.isValidBump([2, 1, 0], [2, 2, 1]))
    await assert.isFalse(await this.repoPackage.isValidBump([1, 1, 1], [5, 0, 0]))
    await assert.isFalse(await this.repoPackage.isValidBump([5, 0, 0], [5, 2, 0]))
    await assert.isFalse(await this.repoPackage.isValidBump([0, 1, 2], [1, 1, 2]))
    await assert.isFalse(await this.repoPackage.isValidBump([0, 0, Math.pow(2, 16)], [0, 0, Math.pow(2, 16) - 1]))
  })

  // valid version as being a correct bump from 0.0.0
  it('cannot create invalid first version', async function () {
    await assertRevert(this.repoPackage.newVersion([1, 1, 0], '0x00', '0x00'))
  })

  context('creating initial version', () => {
    const initialCode = accounts[8] // random addr, irrelevant
    const initialContent = '0x12'

    beforeEach(async function () {
      await this.repoPackage.newVersion([1, 0, 0], initialCode, initialContent)
    })

    const assertVersion = (versionData, semanticVersion, code, contentUri) => {
      const [[maj, min, pat], addr, content] = versionData

      assert.equal(maj, semanticVersion[0], 'major should match')
      assert.equal(min, semanticVersion[1], 'minor should match')
      assert.equal(pat, semanticVersion[2], 'patch should match')

      assert.equal(addr, code, 'code should match')
      assert.equal(content, contentUri, 'content should match')
    }

    it('version is fetchable as latest', async function () {
      assertVersion(await this.repoPackage.getLatest(), [1, 0, 0], initialCode, initialContent)
    })

    it('version is fetchable by semantic version', async function () {
      assertVersion(await this.repoPackage.getBySemanticVersion([1, 0, 0]), [1, 0, 0], initialCode, initialContent)
    })

    it('version is fetchable by contract address', async function () {
      assertVersion(await this.repoPackage.getLatestForContractAddress(initialCode), [1, 0, 0], initialCode, initialContent)
    })

    it('version is fetchable by version id', async function () {
      assertVersion(await this.repoPackage.getByVersionId(1), [1, 0, 0], initialCode, initialContent)
    })

    it('setting contract address to 0 reuses last version address', async function () {
      await this.repoPackage.newVersion([1, 1, 0], '0x00', initialContent)
      assertVersion(await this.repoPackage.getByVersionId(2), [1, 1, 0], initialCode, initialContent)
    })

    it('fails when changing contract address in non major version', async function () {
      await assertRevert(this.repoPackage.newVersion([1, 1, 0], accounts[2], initialContent))
    })

    it('fails when version bump is invalid', async function () {
      await assertRevert(this.repoPackage.newVersion([1, 2, 0], initialCode, initialContent))
    })

    it('fails if requesting version 0', async function () {
      await assertRevert(this.repoPackage.getByVersionId(0))
    })

    context('adding new version', () => {
      const newCode = accounts[9] // random addr, irrelevant
      const newContent = '0x13'

      beforeEach(async function () {
        await this.repoPackage.newVersion([2, 0, 0], newCode, newContent)
      })

      it('new version is fetchable as latest', async function () {
        assertVersion(await this.repoPackage.getLatest(), [2, 0, 0], newCode, newContent)
      })

      it('new version is fetchable by semantic version', async function () {
        assertVersion(await this.repoPackage.getBySemanticVersion([2, 0, 0]), [2, 0, 0], newCode, newContent)
      })

      it('new version is fetchable by contract address', async function () {
        assertVersion(await this.repoPackage.getLatestForContractAddress(newCode), [2, 0, 0], newCode, newContent)
      })

      it('new version is fetchable by version id', async function () {
        assertVersion(await this.repoPackage.getByVersionId(2), [2, 0, 0], newCode, newContent)
      })

      it('old version is fetchable by semantic version', async function () {
        assertVersion(await this.repoPackage.getBySemanticVersion([1, 0, 0]), [1, 0, 0], initialCode, initialContent)
      })

      it('old version is fetchable by contract address', async function () {
        assertVersion(await this.repoPackage.getLatestForContractAddress(initialCode), [1, 0, 0], initialCode, initialContent)
      })

      it('old version is fetchable by version id', async function () {
        assertVersion(await this.repoPackage.getByVersionId(1), [1, 0, 0], initialCode, initialContent)
      })
    })
  })
}
