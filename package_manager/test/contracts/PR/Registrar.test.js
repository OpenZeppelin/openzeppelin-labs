import { hash as namehash } from 'eth-ens-namehash'
import assertRevert from '../../helpers/assertRevert'

const Registrar = artifacts.require('Registrar')
const ENSRegistry = artifacts.require('ENSRegistry')
const ENSResolver = artifacts.require('ENSResolver')

contract('Registrar', ([_, registryOwner, TLDNodeOwner, resolverNodeOwner, myNodeOwner, mySubnodeOwner]) => {
  const ROOT_NODE = 0
  const TLD_NODE = namehash('eth')
  const TLD_LABEL = web3.sha3('eth')
  const RESOLVER_NODE = namehash('resolver.eth')
  const RESOLVER_LABEL = web3.sha3('resolver')
  const MY_NODE = namehash('mynode.eth')
  const MY_NODE_LABEL = web3.sha3('mynode')
  const MY_SUBNODE = namehash('subnode.mynode.eth')
  const MY_SUBNODE_LABEL = web3.sha3('subnode')
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

  beforeEach('deploy custom registrar and register sub node', async function () {
    this.registrar = await Registrar.new()
    await this.registry.setSubnodeOwner(TLD_NODE, MY_NODE_LABEL, myNodeOwner, { from: TLDNodeOwner })
    await this.registry.setOwner(MY_NODE, this.registrar.address, { from: myNodeOwner })
    await this.registrar.initialize(this.registry.address, MY_NODE)
  })

  it('has a root node and an ENS registry', async function () {
    assert.equal(await this.registrar.rootNode(), MY_NODE)
    assert.equal(await this.registrar.registry(), this.registry.address)
  })

  it('fails if initializing without rootnode ownership', async function () {
    return assertRevert(this.registrar.initialize(this.registry.address, TLD_NODE))
  })

  describe('register', function () {
    it('registers a new name', async function () {
      await this.registrar.createName(MY_SUBNODE_LABEL, mySubnodeOwner)

      const owner = await this.registry.owner(MY_SUBNODE)
      assert.equal(owner, mySubnodeOwner)
    })

    it('fails if registering the same name twice', async function () {
      await this.registrar.createName(MY_SUBNODE_LABEL, mySubnodeOwner)
      await assertRevert(this.registrar.createName(MY_SUBNODE_LABEL, mySubnodeOwner))
    })
  })

  describe('unregister', function () {
    beforeEach('register name', async function () {
      await this.registrar.createName(MY_SUBNODE_LABEL, mySubnodeOwner)
    })

    it('can delete names', async function () {
      await this.registrar.deleteName(MY_SUBNODE_LABEL)

      const owner = await this.registry.owner(MY_SUBNODE)
      assert.equal(owner, ZERO_ADDRESS)
    })

    it('fails when deleting a name that does not exist', async function () {
      await this.registrar.deleteName(MY_SUBNODE_LABEL)
      await assertRevert(this.registrar.deleteName(MY_SUBNODE_LABEL))
    })
  })
})
