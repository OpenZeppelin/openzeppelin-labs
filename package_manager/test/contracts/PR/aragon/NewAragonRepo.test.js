import shouldBehaveLikeRepoPackage from '../RepoPackage.behaviour'

const NewAragonRepo = artifacts.require('NewAragonRepoMock')

contract('NewAragonRepo', accounts => {
  describe('repo package', function () {
    beforeEach('deploy aragon repo', async function () {
      this.repoPackage = await NewAragonRepo.new()
      await this.repoPackage.initialize()
    })

    shouldBehaveLikeRepoPackage(accounts)
  })
})
