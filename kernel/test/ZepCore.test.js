const ZepCore = artifacts.require('ZepCore');
const ZepToken = artifacts.require('ZepToken');
const KernelInstance = artifacts.require('KernelInstance');

const should = require('chai')
  .use(require('chai-as-promised'))
  .should();
// TODO: Add integration tests

contract('ZepCore', ([_, owner, developer, user, anotherDeveloper]) => {
  const newVersionCost = 2;
  const developerFraction = 10;

  beforeEach(async function () {
    this.zepCore = await ZepCore.new(newVersionCost, developerFraction, {from: owner});
    
    const name = "Zeppelin";
    const version = "0.1";
    this.kernelInstance = await KernelInstance.new(name, version, 0, {from: developer});

    const anotherVersion = "0.2";
    this.anotherKernelInstance = await KernelInstance.new(name, anotherVersion, 0, {from: anotherDeveloper});

    const tokenAddress = await this.zepCore.token();
    this.token = await ZepToken.at(tokenAddress);
    await this.token.mint(owner, 10000, {from: owner});
    await this.token.transfer(developer, 100, {from: owner});
    await this.token.approve(this.zepCore.address, 100, {from: developer});
    await this.token.transfer(user, 1000, {from: owner});
  });

  it('has a ZepToken', async function () {
    assert.equal(await this.token.name(), "Zep Token");
    assert.equal(await this.token.symbol(), "ZEP");
    assert.equal(await this.token.decimals(), 18);
  });

  it('registers instances', async function () {
    await this.zepCore.register(this.kernelInstance.address, {from: developer}).should.be.fulfilled;
  });

  it('should accept stakes', async function () {
    const stakeValue = 42;
    const effectiveStake = stakeValue-Math.floor(stakeValue/developerFraction);
    await this.token.approve(this.zepCore.address, stakeValue, {from: user});
    await this.zepCore.stake(this.kernelInstance.address, stakeValue, 0, {from: user});
    
    const { c: staked } = await this.zepCore.totalStakedFor.call(this.kernelInstance.address);
    assert.equal(Number(staked), effectiveStake);
    const { c: totalStaked } = await this.zepCore.totalStaked.call();
    assert.equal(Number(totalStaked), effectiveStake);
  });

  it('should accept unstakes', async function () {
    const stakeValue = 42;
    const unstakeValue = 24;
    const effectiveStake = stakeValue-Math.floor(stakeValue/developerFraction)-unstakeValue;
    await this.token.approve(this.zepCore.address, stakeValue, {from: user});
    await this.zepCore.stake(this.kernelInstance.address, stakeValue, 0, {from: user});
    await this.zepCore.unstake(this.kernelInstance.address, unstakeValue, 0, {from: user});
    
    const { c: staked } = await this.zepCore.totalStakedFor.call(this.kernelInstance.address);
    assert.equal(Number(staked), effectiveStake);
    const { c: totalStaked } = await this.zepCore.totalStaked.call();
    assert.equal(Number(totalStaked), effectiveStake);
  });

  it.only('should transfer stakes', async function () {
    const stakeValue = 420;
    const transferValue = 20;
    const effectiveStakeFirst = stakeValue-Math.floor(stakeValue/developerFraction)-transferValue;
    const effectiveStakeSecond = transferValue-Math.floor(transferValue/developerFraction);
    const totalEffectivelyStaked = effectiveStakeFirst+effectiveStakeSecond;

    await this.token.approve(this.zepCore.address, stakeValue, {from: user});
    await this.zepCore.stake(this.kernelInstance.address, stakeValue, 0, {from: user});
    await this.zepCore.transferStake(this.kernelInstance.address, this.anotherKernelInstance.address, transferValue, 0, {from: user});
    
    const { c: stakedToFirst } = await this.zepCore.totalStakedFor.call(this.kernelInstance.address);
    assert.equal(Number(stakedToFirst), effectiveStakeFirst);

    const { c: stakedToSecond } = await this.zepCore.totalStakedFor.call(this.anotherKernelInstance.address);
    assert.equal(Number(stakedToSecond), effectiveStakeSecond);

    const { c: totalStaked } = await this.zepCore.totalStaked.call();
    assert.equal(Number(totalStaked), totalEffectivelyStaked);
  });


});
