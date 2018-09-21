import { hash as namehash } from 'eth-ens-namehash'
import assertRevert from '../../../helpers/assertRevert'

const keccak256 = require('js-sha3').keccak_256

const AragonRegistrar = artifacts.require('AragonRegistrar')

const ENS = artifacts.require('ENS')
const ENSFactory = artifacts.require('ENSFactory')
const Kernel = artifacts.require('Kernel')
const ACL = artifacts.require('ACL')
const APMRegistry = artifacts.require('APMRegistry')
const Repo = artifacts.require('Repo')
const APMRegistryFactory = artifacts.require('APMRegistryFactory')
const DAOFactory = artifacts.require('DAOFactory')

// Using APMFactory in order to reuse it
contract('AragonRegistrar', accounts => {
  let baseDeployed, apmFactory, ensFactory, daoFactory, ens, registrar
  const ensOwner = accounts[0]
  const apmOwner = accounts[1]
  const repoDev  = accounts[2]
  const notOwner = accounts[5]

  const rootNode = namehash('aragonpm.eth')
  const holanode = namehash('hola.aragonpm.eth')
  const holalabel = '0x'+keccak256('hola')

  const zeroAddr = '0x0000000000000000000000000000000000000000'

  before(async () => {
    const bases = [APMRegistry, Repo, AragonRegistrar]
    baseDeployed = await Promise.all(bases.map(base => base.new()))

    ensFactory = await ENSFactory.new()

    const kernelBase = await Kernel.new(true) // petrify immediately
    const aclBase = await ACL.new()
    daoFactory = await DAOFactory.new(kernelBase.address, aclBase.address, '0x00')
  })

  beforeEach(async () => {
    const baseAddrs = baseDeployed.map(c => c.address)
    apmFactory = await APMRegistryFactory.new(daoFactory.address, ...baseAddrs, '0x0', ensFactory.address)
    ens = ENS.at(await apmFactory.ens())
    const receipt = await apmFactory.newAPM(namehash('eth'), '0x'+keccak256('aragonpm'), apmOwner)
    const apmAddr = receipt.logs.filter(l => l.event === 'DeployAPM')[0].args.apm
    const registry = APMRegistry.at(apmAddr)

    const dao = Kernel.at(await registry.kernel())
    const acl = ACL.at(await dao.acl())

    registrar = AragonRegistrar.at(await registry.registrar())
    const subdomainRegistrar = baseDeployed[2]

    const registryRegistrar = await registry.registrar();
    const createNameRole = await subdomainRegistrar.CREATE_NAME_ROLE();
    await acl.grantPermission(apmOwner, registryRegistrar, createNameRole, { from: apmOwner })
    const deleteNameRole = await subdomainRegistrar.DELETE_NAME_ROLE();
    await acl.createPermission(apmOwner, registryRegistrar, deleteNameRole, apmOwner, { from: apmOwner })
  })

  it('can create name', async () => {
    await registrar.createName(holalabel, apmOwner, { from: apmOwner })

    assert.equal(await ens.owner(namehash('hola.aragonpm.eth')), apmOwner, 'should have created name')
  })

  it('fails if creating names twice', async () => {
    await registrar.createName(holalabel, apmOwner, { from: apmOwner })
    await assertRevert(registrar.createName(holalabel, apmOwner, { from: apmOwner }))
  })

  it('fails if deleting name not yet created', async () => {
    await assertRevert(registrar.deleteName(holalabel, { from: apmOwner }))
  })

  it('fails if not authorized to create name', async () => {
    await assertRevert(registrar.createName(holalabel, apmOwner, { from: notOwner }))
  })

  it('can delete names', async () => {
    await registrar.createName(holalabel, apmOwner, { from: apmOwner })
    await registrar.deleteName(holalabel, { from: apmOwner })

    assert.equal(await ens.owner(holanode), zeroAddr, 'should have reset name')
  })

  it('can delete names registered to itself', async () => {
    await registrar.createName(holalabel, registrar.address, { from: apmOwner })
    await registrar.deleteName(holalabel, { from: apmOwner })

    assert.equal(await ens.owner(holanode), zeroAddr, 'should have reset name')
  })

  it('fails if initializing without rootnode ownership', async () => {
    const reg = await AragonRegistrar.new()
    const ens = await ENS.new()

    await assertRevert(reg.initialize(ens.address, holanode))
  })
})
