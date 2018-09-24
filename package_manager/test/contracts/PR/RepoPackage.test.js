import shouldBehaveLikeRepoPackage from './RepoPackage.behaviour'

const RepoPackage = artifacts.require('RepoPackage')

contract('RepoPackage', accounts => {
  beforeEach('deploy repo package', async function () {
    this.repoPackage = await RepoPackage.new()
  })

  shouldBehaveLikeRepoPackage(accounts)
})
