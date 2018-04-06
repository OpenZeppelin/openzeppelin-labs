const BigNumber = web3.BigNumber;
const ZepCore = artifacts.require('ZepCore');
const ZepToken = artifacts.require('ZepToken');
const KernelStakes = artifacts.require('KernelStakes');
const KernelInstance = artifacts.require('KernelInstance');

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();
  
contract('ZepCore', ([_, owner, developer, user, anotherDeveloper]) => {
  const newVersionCost = 2;
  const developerFraction = 10;

  beforeEach(async function () {
    this.zepCore = await ZepCore.new(newVersionCost, developerFraction, { from: owner });
    this.stakes = KernelStakes.at(await this.zepCore.stakes());
    
    const name = "Zeppelin";
    const version = "0.1";
    this.kernelInstance = await KernelInstance.new(name, version, 0, { from: developer });

    const anotherVersion = "0.2";
    this.anotherKernelInstance = await KernelInstance.new(name, anotherVersion, 0, {from: anotherDeveloper});

    const tokenAddress = await this.zepCore.token();
    this.token = await ZepToken.at(tokenAddress);
    await this.token.mint(owner, 10000, { from: owner });
    await this.token.transfer(developer, 100, { from: owner });
    await this.token.approve(this.zepCore.address, 100, { from: developer });
    await this.token.transfer(user, 1000, { from: owner });
  });

  it('has a ZepToken', async function () {
    assert.equal(await this.token.name(), "Zep Token");
    assert.equal(await this.token.symbol(), "ZEP");
    assert.equal(await this.token.decimals(), 18);
  });

  it('registers instances', async function () {
    await this.zepCore.register(this.kernelInstance.address, { from: developer }).should.be.fulfilled;
  });

  it('should accept stakes', async function () {
    const stakeValue = 42;
    const effectiveStake = stakeValue - Math.floor(stakeValue/developerFraction);
    await this.token.approve(this.zepCore.address, stakeValue, { from: user });
    await this.zepCore.stake(this.kernelInstance.address, stakeValue, 0, { from: user });
    
    const staked = await this.stakes.totalStakedFor(this.kernelInstance.address);
    staked.should.be.bignumber.equal(effectiveStake);
    const totalStaked = await this.stakes.totalStaked();
    totalStaked.should.be.bignumber.equal(effectiveStake);
  });

  it('should accept unstakes', async function () {
    const stakeValue = 42;
    const unstakeValue = 24;
    const effectiveStake = stakeValue-Math.floor(stakeValue/developerFraction)-unstakeValue;
    await this.token.approve(this.zepCore.address, stakeValue, { from: user });
    await this.zepCore.stake(this.kernelInstance.address, stakeValue, 0, { from: user });
    await this.zepCore.unstake(this.kernelInstance.address, unstakeValue, 0, { from: user });
    
    const staked = await this.stakes.totalStakedFor(this.kernelInstance.address);
    staked.should.be.bignumber.equal(effectiveStake);
    const totalStaked = await this.stakes.totalStaked();
    totalStaked.should.be.bignumber.equal(effectiveStake);
  });

  it('should transfer stakes', async function () {
    const stakeValue = 420;
    const transferValue = 20;
    const effectiveStakeFirst = stakeValue - Math.floor(stakeValue/developerFraction) - transferValue;
    const effectiveStakeSecond = transferValue - Math.floor(transferValue/developerFraction);
    const totalEffectivelyStaked = effectiveStakeFirst+effectiveStakeSecond;

    await this.token.approve(this.zepCore.address, stakeValue, { from: user });
    await this.zepCore.stake(this.kernelInstance.address, stakeValue, 0, { from: user });
    await this.zepCore.transferStake(this.kernelInstance.address, this.anotherKernelInstance.address, transferValue, 0, { from: user });
    
    const stakedToFirst = await this.stakes.totalStakedFor(this.kernelInstance.address);
    stakedToFirst.should.be.bignumber.equal(effectiveStakeFirst);

    const stakedToSecond = await this.stakes.totalStakedFor(this.anotherKernelInstance.address);
    stakedToSecond.should.be.bignumber.equal(effectiveStakeSecond);

    const totalStaked = await this.stakes.totalStaked();
    totalStaked.should.be.bignumber.equal(totalEffectivelyStaked);
  });
});
