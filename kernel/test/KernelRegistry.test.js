import assertRevert from './helpers/assertRevert';

const KernelInstance = artifacts.require('KernelInstance');
const KernelRegistry = artifacts.require('KernelRegistry');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('KernelRegistry', ([owner, other]) => {
  const name = "Test";
  const version_0 = "0.0";
  const version_1 = "0.1";

  beforeEach(async function () {
    this.kernelInstance_0 = await KernelInstance.new(name, version_0, 0);
    await this.kernelInstance_0.freeze();
    this.kernelInstance_1 = await KernelInstance.new(name, version_1, this.kernelInstance_0.address);
    this.kernelRegistry = await KernelRegistry.new();
  });

  it('should add single instance', async function () {
    await this.kernelRegistry.addInstance(this.kernelInstance_0.address).should.be.fulfilled;
  });

  it('should add many instances', async function () {
    await this.kernelRegistry.addInstance(this.kernelInstance_0.address);
    await this.kernelRegistry.addInstance(this.kernelInstance_1.address).should.be.fulfilled;
  });

  it('should emit event when adding instance', async function () {
    const receipt = await this.kernelRegistry.addInstance(this.kernelInstance_0.address);
    assert.equal(receipt.logs.length, 1); //Make sure there is a single event
    const event = receipt.logs.find(e => e.event === 'NewInstance');
    assert.equal(event.args.instance, this.kernelInstance_0.address);
  });

  it('should correctly recover instances', async function () {
    await this.kernelRegistry.addInstance(this.kernelInstance_0.address);
    const instance = await this.kernelRegistry.getInstance(name, version_0);
    assert.equal(instance, this.kernelInstance_0.address);
  });

  it('should only allow owner to add instances', async function () {
    await assertRevert(this.kernelRegistry.addInstance(this.kernelInstance_0.address, { from: other }));
  });

  it('should not allow repeated instances', async function () {
    await this.kernelRegistry.addInstance(this.kernelInstance_0.address);
    await assertRevert(this.kernelRegistry.addInstance(this.kernelInstance_0.address));
  });

  it('should not allow adding a different instance with repeated name and version', async function () {
    await this.kernelRegistry.addInstance(this.kernelInstance_0.address);
    this.kernelInstance_0b = await KernelInstance.new(name, version_0, 0);
    await assertRevert(this.kernelRegistry.addInstance(this.kernelInstance_0b.address));
  });

});
