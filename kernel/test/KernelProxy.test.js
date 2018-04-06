import decodeLogs from './helpers/decodeLogs';
const ZepCore = artifacts.require('ZepCore');
const Registry = artifacts.require('zos-core/contracts/Registry.sol');
const ZepToken = artifacts.require('ZepToken');
const PickACard = artifacts.require('PickACard');
const ERC721Token = artifacts.require('ERC721Token');
const KernelInstance = artifacts.require('KernelInstance');
const ProjectController = artifacts.require('ProjectController');
const UpgradeabilityProxyFactory = artifacts.require('UpgradeabilityProxyFactory');

const should = require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('KernelProxy', ([_, zeppelin, developer, someone, anotherone]) => {
  const version = '1.8.0';
  const distribution = 'Zeppelin';
  const contractName = 'ERC721Token';

  beforeEach(async function () {
    // deploy kernel instance
    const erc721 = await ERC721Token.new();
    const instance = await KernelInstance.new(distribution, version, 0, { from: developer });
    await instance.addImplementation(contractName, erc721.address, { from: developer });

    // register a new kernel instance
    const newVersionCost = 2;
    const developerFraction = 10;
    this.zepCore = await ZepCore.new(newVersionCost, developerFraction, { from: zeppelin });
    const zepTokenAddress = await this.zepCore.token();
    const zepToken = await ZepToken.at(zepTokenAddress);
    await zepToken.mint(developer, newVersionCost, { from: zeppelin });
    await zepToken.approve(this.zepCore.address, newVersionCost, { from: developer });
    await this.zepCore.register(instance.address, { from: developer });

    // deploy a testing contract that uses zos
    this.factory = await UpgradeabilityProxyFactory.new();
    this.registry = await Registry.new({ from: zeppelin })
    this.controller = await ProjectController.new('My Project', this.registry.address, this.factory.address, this.zepCore.address);
    const { receipt } = await this.controller.create(distribution, version, contractName);
    const logs = decodeLogs([receipt.logs[0]], UpgradeabilityProxyFactory, this.factory.address);
    const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy;
    this.mock = await PickACard.new(proxyAddress);
  });

  it('uses the selected zos kernel instance', async function () {
    await this.mock.pick(5, { from: someone });

    const erc721 = ERC721Token.at(await this.mock.erc721())
    await erc721.transferFrom(someone, anotherone, 5, { from: someone })
    const owner = await erc721.ownerOf(5);

    assert.equal(owner, anotherone);
  });

  it('should not allow picking the same number twice', async function () {
    await this.mock.pick(5, { from: someone });
    await this.mock.pick(5, { from: anotherone }).should.be.rejected;
  });

  describe('when creating another instance of the testing contract', function () {
    beforeEach(async function () {
      const { receipt } = await this.controller.create(distribution, version, contractName);
      const logs = decodeLogs([receipt.logs[0]], UpgradeabilityProxyFactory, this.factory.address);
      this.anotherProxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy;
      this.anotherMock = await PickACard.new(this.anotherProxyAddress);
    })

    it('creates different instances of the proxy', async function () {
      const ERC721 = ERC721Token.at(await this.mock.erc721())
      const anotherERC721 = ERC721Token.at(await this.anotherMock.erc721())

      assert.notEqual(ERC721.address, anotherERC721.address);
    });

    it('should allow picking the same number twice from independent instances', async function () {
      await this.mock.pick(5, { from: someone });
      await this.anotherMock.pick(5, { from: anotherone }).should.be.fulfilled;
    });

    it('storage takes place in KernelProxy', async function () {
      //fetch the owner of token 5, in `mapping (uint256 => address) internal tokenOwner;`
      const ind = '0000000000000000000000000000000000000000000000000000000000000000' // tokenOwner position in storage
      const key = '0000000000000000000000000000000000000000000000000000000000000007' // tokenId
      const newkey = web3.sha3(key + ind, { encoding: "hex" })

      await this.anotherMock.pick(7, { from: someone });
      const storage = await web3.eth.getStorageAt(this.anotherProxyAddress, newkey);
      assert.equal(storage, someone);
    });
  });
});
