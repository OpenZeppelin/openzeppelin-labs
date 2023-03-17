import { hash as namehash } from 'eth-ens-namehash'
import encodeCall from '../../../helpers/encodeCall'
import assertRevert from '../../../helpers/assertRevert'

const ENSRegistry = artifacts.require('ENSRegistry')
const ENSResolver = artifacts.require('ENSResolver')
const ZeppelinRegistrar = artifacts.require('ZeppelinRegistrar')

contract('ZeppelinRegistrar', ([_, registryOwner, registrarOwner, TLDNodeOwner, resolverNodeOwner, zeppelinNodeOwner, openZeppelinNodeOwner, anotherAddress]) => {
  const ROOT_NODE = 0
  const TLD_NODE = namehash('eth')
  const TLD_LABEL = web3.sha3('eth')
  const RESOLVER_NODE = namehash('resolver.eth')
  const RESOLVER_LABEL = web3.sha3('resolver')
  const ZEPPELIN_NODE = namehash('zeppelin.eth')
  const ZEPPELIN_LABEL = web3.sha3('zeppelin')
  const OPENZEPPELIN_NODE = namehash('openzeppelin.zeppelin.eth')
  const OPENZEPPELIN_LABEL = web3.sha3('openzeppelin')
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  beforeEach('deploy a new registry and resolver instances', async function () {
    this.registry = await ENSRegistry.new({ from: registryOwner })
    this.resolver = await ENSResolver.new(this.registry.address)
  })

  beforeEach('register TLD and resolver nodes', async function () {
    await this.registry.setSubnodeOwner(ROOT_NODE, TLD_LABEL, TLDNodeOwner, { from: registryOwner })
    await this.registry.setSubnodeOwner(TLD_NODE, RESOLVER_LABEL, resolverNodeOwner, { from: TLDNodeOwner })
    await this.registry.setResolver(RESOLVER_NODE, this.resolver.address, { from: resolverNodeOwner })
    await this.resolver.setAddr(RESOLVER_NODE, this.resolver.address, { from: resolverNodeOwner })
  })

  beforeEach('deploy Zeppelin registrar and register Zeppelin nodes', async function () {
    this.registrar = await ZeppelinRegistrar.new()
    await this.registry.setSubnodeOwner(TLD_NODE, ZEPPELIN_LABEL, zeppelinNodeOwner, { from: TLDNodeOwner })
    await this.registry.setOwner(ZEPPELIN_NODE, this.registrar.address, { from: zeppelinNodeOwner })

    // we need a low level call cause Truffle cannot handle multiple functions with the same name
    const data = encodeCall('initialize', ['address', 'bytes32'], [this.registry.address, ZEPPELIN_NODE])
    await this.registrar.sendTransaction({ data, from: registrarOwner })
  })

  it('has a root node, an ENS registry and an owner', async function () {
    assert.equal(await this.registrar.owner(), registrarOwner)
    assert.equal(await this.registrar.rootNode(), ZEPPELIN_NODE)
    assert.equal(await this.registrar.registry(), this.registry.address)
  })

  it('fails if initializing without rootnode ownership', async function () {
    const registrar = await ZeppelinRegistrar.new()
    const data = encodeCall('initialize', ['address', 'bytes32'], [this.registry.address, TLD_NODE])
    await assertRevert(registrar.sendTransaction({ data, from: registrarOwner }))
  })

  describe('register', function () {
    describe('when the sender is the owner of the registrar', function () {
      const from = registrarOwner

      it('registers a new name', async function () {
        await this.registrar.createName(OPENZEPPELIN_LABEL, openZeppelinNodeOwner, { from })

        const owner = await this.registry.owner(OPENZEPPELIN_NODE)
        assert.equal(owner, openZeppelinNodeOwner)
      })

      it('fails if registering the same name twice', async function () {
        await this.registrar.createName(OPENZEPPELIN_LABEL, openZeppelinNodeOwner, { from })
        await assertRevert(this.registrar.createName(OPENZEPPELIN_LABEL, openZeppelinNodeOwner, { from }))
      })
    })

    describe('when the sender is not the owner of the registrar', function () {
      const from = anotherAddress

      it('reverts', async function () {
        await assertRevert(this.registrar.createName(OPENZEPPELIN_LABEL, openZeppelinNodeOwner, { from }))
      })
    })
  })

  describe('unregister', function () {
    beforeEach('register openzeppelin name', async function () {
      await this.registrar.createName(OPENZEPPELIN_LABEL, openZeppelinNodeOwner, { from: registrarOwner })
    })

    describe('when the sender is the owner of the registrar', function () {
      const from = registrarOwner

      it('can delete names', async function () {
        await this.registrar.deleteName(OPENZEPPELIN_LABEL, { from })

        const owner = await this.registry.owner(OPENZEPPELIN_NODE)
        assert.equal(owner, ZERO_ADDRESS)
      })

      it('fails when deleting a name that does not exist', async function () {
        await this.registrar.deleteName(OPENZEPPELIN_LABEL, { from })
        await assertRevert(this.registrar.deleteName(OPENZEPPELIN_LABEL, { from }))
      })
    })

    describe('when the sender is not the owner of the registrar', function () {
      const from = anotherAddress

      it('reverts', async function () {
        await assertRevert(this.registrar.deleteName(OPENZEPPELIN_LABEL, { from }))
      })
    })
  })
})
