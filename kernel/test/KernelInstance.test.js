const ZepCore = artifacts.require('ZepCore');
const ZepToken = artifacts.require('ZepToken');
const KernelRegistry = artifacts.require('KernelRegistry');
const KernelInstance = artifacts.require('KernelInstance');


// TODO: Add integration tests

contract('KernelInstance', ([developer, implementation_address_1]) => {
  const name = "Test";
  const version = "0.0";

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
    const contract_name = "TestContract";
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
  });
});
