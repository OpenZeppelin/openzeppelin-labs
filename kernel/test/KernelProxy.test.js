const ZepCore = artifacts.require('ZepCore');
const ZepToken = artifacts.require('ZepToken');
const PickACard = artifacts.require('PickACard');
const ERC721Token = artifacts.require('ERC721Token');
const KernelInstance = artifacts.require('KernelInstance');
const KernelProxyFactory = artifacts.require('KernelProxyFactory');

const should = require('chai')
  .use(require('chai-as-promised'))
  .should();

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
    const proxyAddress = logs.find(l => l.event === 'ProxyCreated').args.proxy;
    this.mock = await PickACard.new(proxyAddress);

    // deploy another instance of the testing contract
    const { logs: logs2 }  = await factory.createProxy(distribution, version, contractName);
    this.proxyAddress2 = logs2.find(l => l.event === 'ProxyCreated').args.proxy;
    this.mock2 = await PickACard.new(this.proxyAddress2);
    
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
  
  it('creates different instances of the proxy', async function () {
    const erc721 = ERC721Token.at(await this.mock.erc721())
    const erc721_2 = ERC721Token.at(await this.mock2.erc721())
    assert.notEqual(erc721.address, erc721_2.address);
  });

  it('should allow picking the same number twice from independent instances', async function () {
    await this.mock.pick(5, { from: someone });
    await this.mock2.pick(5, { from: anotherone }).should.be.fulfilled;
  });

  it('storage takes place in KernelProxy', async function () {
    //fetch the owner of token 5, in `mapping (uint256 => address) internal tokenOwner;`
    var ind = '0000000000000000000000000000000000000000000000000000000000000002' // tokenOwner position in storage
    var key =  '0000000000000000000000000000000000000000000000000000000000000007' // tokenId
    var newkey =  web3.sha3(key + ind, {"encoding":"hex"})
    await this.mock2.pick(7, { from: someone });
    var storage = await web3.eth.getStorageAt(this.proxyAddress2, newkey);
    assert.equal(storage, someone);
  });

});
