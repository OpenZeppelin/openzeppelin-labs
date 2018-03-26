const ZepCore = artifacts.require('ZepCore');
const ZepToken = artifacts.require('ZepToken');

// TODO: Add integration tests

contract('ZepCore', () => {
  const newVersionCost = 2;
  const developerFraction = 10;

  beforeEach(async function () {
    this.zepCore = await ZepCore.new(newVersionCost, developerFraction);
  });

  it('has a ZepToken', async function () {
    const tokenAddress = await this.zepCore.token();
    const token = await ZepToken.at(tokenAddress);

    assert.equal(await token.name(), "Zep Token");
    assert.equal(await token.symbol(), "ZEP");
    assert.equal(await token.decimals(), 18);
  });
});
