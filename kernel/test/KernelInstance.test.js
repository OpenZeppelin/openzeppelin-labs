import EVMRevert from './helpers/EVMRevert';
const KernelInstance = artifacts.require('KernelInstance');

require('chai')
  .use(require('chai-as-promised'))
  .should();

contract('KernelInstance', ([developer, implementation_address_1, implementation_address_2]) => {
  const name = "Test";
  const version = "0.0";
  const contract_name = "TestContract";
  const contract_name_2 = "AnotherContract";
    

  beforeEach(async function () {
    this.kernelInstance = await KernelInstance.new(name, version, 0);
  });

  it('is initialized with correct parameters', async function () {
    const instance_name = await this.kernelInstance.name();
    const instance_version = await this.kernelInstance.version();
    const instance_developer = await this.kernelInstance.developer();
        
    assert.equal(instance_name, name);
    assert.equal(instance_version, version);
    assert.equal(instance_developer, developer);
  });

  it('starts unfrozen', async function () {
    const frozen = await this.kernelInstance.frozen();
      
    assert.isFalse(frozen);
  });

  it('returns correct hash', async function () {
    const instance_hash = await this.kernelInstance.getHash();
    const hash = web3.sha3(name.concat(version));

    assert.equal(instance_hash, hash);
  });

  describe('adding implementations', async function () {
    var receipt;
    
    beforeEach(async function () {
      receipt = await this.kernelInstance.addImplementation(contract_name, implementation_address_1);
    });

    it('emits correct event', async function () {
      const event = receipt.logs.find(e => e.event === 'ImplementationAdded');
      assert.equal(event.args.contractName, contract_name);
      assert.equal(event.args.implementation, implementation_address_1);
    });

    it('returns correct address', async function () {
      const instance_implementation_1 = await this.kernelInstance.getImplementation(contract_name);
      assert.equal(instance_implementation_1, implementation_address_1);
    });

    it('should not add implementation for same contract twice', async function () {
      await this.kernelInstance.addImplementation(contract_name, implementation_address_2).should.be.rejectedWith(EVMRevert);
    });

    it('should fail if frozen', async function () {
      await this.kernelInstance.freeze();
      await this.kernelInstance.addImplementation(contract_name_2, implementation_address_2).should.be.rejectedWith(EVMRevert);
    });

    it('should not have offspring if not yet frozen', async function () {
      const version2 = "0.1";
      await KernelInstance.new(name, version2, this.kernelInstance.address).should.be.rejectedWith(EVMRevert);
    });
  });

  describe('initializing with parent', async function () {
    const version2 = "0.1";

    beforeEach(async function () {
      this.kernelInstance.addImplementation(contract_name, implementation_address_1);
      await this.kernelInstance.freeze();
      this.kernelInstance2 = await KernelInstance.new(name, version2, this.kernelInstance.address);
    });

    it('is initialized with correct parameters', async function () {
      const instance_name = await this.kernelInstance2.name();
      const instance_version = await this.kernelInstance2.version();
      const instance_developer = await this.kernelInstance2.developer();
      const instance_parent = await this.kernelInstance2.parent();

      assert.equal(instance_name, name);
      assert.equal(instance_version, version2);
      assert.equal(instance_developer, developer);
      assert.equal(instance_parent, this.kernelInstance.address);
    });
  
    it('should return parent implementation', async function () {
      const instance_implementation = await this.kernelInstance2.getImplementation(contract_name);
      assert.equal(instance_implementation, implementation_address_1);
    });

    it('WILL OVERRIDE a parent implementation, use freeze functionality to prevent this', async function () {
      await this.kernelInstance2.addImplementation(contract_name, implementation_address_2).should.be.fulfilled;
    });

  });
});
