const ZepCore = artifacts.require('ZepCore');
const ZepToken = artifacts.require('ZepToken');
const PickACard = artifacts.require('PickACard');
const ERC721Token = artifacts.require('ERC721Token');
const KernelInstance = artifacts.require('KernelInstance');
const KernelProxyFactory = artifacts.require('KernelProxyFactory');

contract('zeppelin_os', ([_, zeppelin, developer, someone, anotherone]) => {
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
    const zepCore = await ZepCore.new(newVersionCost, developerFraction, { from: zeppelin });
    const zepTokenAddress = await zepCore.token();
    const zepToken = await ZepToken.at(zepTokenAddress);
    await zepToken.mint(developer, newVersionCost, { from: zeppelin });
    await zepToken.approve(zepCore.address, newVersionCost, { from: developer });
    await zepCore.register(instance.address, { from: developer });

    // deploy a testing contract that uses zos
    const factory = await KernelProxyFactory.new(zepCore.address);
    const { logs } = await factory.createProxy(distribution, version, contractName);
    const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy
    this.mock = await PickACard.new(proxyAddress);
  });

  it('uses the selected zos kernel instance', async function () {
    await this.mock.pick(5, { from: someone });

    const erc721 = ERC721Token.at(await this.mock.erc721())
    await erc721.transferFrom(someone, anotherone, 5, { from: someone })
    const owner = await erc721.ownerOf(5);

    assert.equal(owner, anotherone);
  });
});
