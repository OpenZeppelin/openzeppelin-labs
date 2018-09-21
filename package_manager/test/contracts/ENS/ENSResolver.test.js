import { soliditySHA3 } from 'ethereumjs-abi'
import assertThrow from '../../helpers/assertThrow'
import assertRevert from '../../helpers/assertRevert'

const ENSRegistry = artifacts.require('ENSRegistry')
const ENSResolver = artifacts.require('ENSResolver')

contract('ENSResolver', ([_, resolverCreator, registryOwner, anotherAddress]) => {
  const ROOT_NODE = 0
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  beforeEach('deploy a new registry and resolver instances', async function () {
    this.registry = await ENSRegistry.new({ from: registryOwner })
    this.resolver = await ENSResolver.new(this.registry.address, { from: resolverCreator })
  })

  it('sets the given registry as the ENS registry of the resolver', async function () {
    assert.equal(await this.resolver.registry(), this.registry.address)
  })

  it('fails when calling the fallback function', async function () {
    await assertThrow(this.resolver.sendTransaction())
  })

  describe('supports interface', function () {
    const interfaces = {
      ERC165_ID: '0x01ffc9a7',
      ERC137_ID: '0x3b3b57de',
      ERC181_ID: '0x691f3431',
      CONTENT_ID: '0xd8389dc5',
    }

    Object.keys(interfaces).forEach(id => {

      it(`supports ${id} interface`, async function () {
        assert.equal(await this.resolver.supportsInterface(interfaces[id]), true)
      })
    })
  })

  describe('name', function () {
    const node = ROOT_NODE

    describe('when the name for the requested node was not set yet', function () {
      it('returns an empty string', async function () {
        assert.equal(await this.resolver.name(node), '')
      })
    })

    describe('while setting a name for the requested node', function () {
      const name = 'openzeppelin'

      describe('when the sender is the owner of the requested node', function () {
        const from = registryOwner

        it('sets a name for the requested node', async function () {
          await this.resolver.setName(node, name, { from })

          assert.equal(await this.resolver.name(node), name)
        })

        it('emits an event', async function () {
          const { logs } = await this.resolver.setName(node, name, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'NameChanged')
          assert.equal(logs[0].args.node, node)
          assert.equal(logs[0].args.name, name)
        })
      })

      describe('when the sender is not the owner of the requested node', function () {
        const from = anotherAddress

        it('reverts', async function () {
          await assertRevert(this.resolver.setName(node, name, { from }))
        })
      })
    })
  })

  describe('address', function () {
    const node = ROOT_NODE

    describe('when the address for the requested node was not set yet', function () {
      it('returns a zero address', async function () {
        assert.equal(await this.resolver.addr(node), ZERO_ADDRESS)
      })
    })

    describe('while setting an address for the requested node', function () {
      const addr = anotherAddress

      describe('when the sender is the owner of the requested node', function () {
        const from = registryOwner

        it('sets an address for the requested node', async function () {
          await this.resolver.setAddr(node, addr, { from })

          assert.equal(await this.resolver.addr(node), addr)
        })

        it('emits an event', async function () {
          const { logs } = await this.resolver.setAddr(node, addr, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'AddrChanged')
          assert.equal(logs[0].args.node, node)
          assert.equal(logs[0].args.a, addr)
        })
      })

      describe('when the sender is not the owner of the requested node', function () {
        const from = anotherAddress

        it('reverts', async function () {
          await assertRevert(this.resolver.setAddr(node, addr, { from }))
        })
      })
    })
  })

  describe('content', function () {
    const node = ROOT_NODE

    describe('when the content for the requested node was not set yet', function () {
      it('returns zero', async function () {
        assert.equal(await this.resolver.content(node), 0)
      })
    })

    describe('while setting an address for the requested node', function () {
      const content = '0x' + soliditySHA3(['bytes32'], ['my content']).toString('hex')

      describe('when the sender is the owner of the requested node', function () {
        const from = registryOwner

        it('sets a content hash for the requested node', async function () {
          await this.resolver.setContent(node, content, { from })

          assert.equal(await this.resolver.content(node), content)
        })

        it('emits an event', async function () {
          const { logs } = await this.resolver.setContent(node, content, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'ContentChanged')
          assert.equal(logs[0].args.node, node)
          assert.equal(logs[0].args.hash, content)
        })
      })

      describe('when the sender is not the owner of the requested node', function () {
        const from = anotherAddress

        it('reverts', async function () {
          await assertRevert(this.resolver.setContent(node, content, { from }))
        })
      })
    })
  })
})
