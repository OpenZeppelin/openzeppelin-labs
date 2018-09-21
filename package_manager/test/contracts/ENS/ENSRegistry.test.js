import ENSNodeID from '../../helpers/ENSNodeID'
import assertRevert from '../../helpers/assertRevert'

const ENSRegistry = artifacts.require('ENSRegistry')

contract('ENSRegistry', ([_, owner, anotherAddress, resolverAddress]) => {
  const ROOT_NODE = 0
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

  beforeEach('deploy a new registry instance', async function () {
    this.registry = await ENSRegistry.new({ from: owner })
  })

  it('sets the sender as the owner of the root node', async function () {
    assert.equal(await this.registry.owner(ROOT_NODE), owner)
  })

  it('leaves the rest of the root node information unset', async function () {
    assert.equal(await this.registry.ttl(ROOT_NODE), 0)
    assert.equal(await this.registry.resolver(ROOT_NODE), ZERO_ADDRESS)
  })

  describe('transferring ownership', function () {

    describe('when the sender is the owner of the requested node', function () {
      const from = owner

      function assertItSetsTheOwner(newOwner) {
        it('sets the owner of the requested node', async function () {
          await this.registry.setOwner(ROOT_NODE, newOwner, { from })

          assert.equal(await this.registry.owner(ROOT_NODE), newOwner)
        })

        it('emits an event', async function () {
          const { logs } = await this.registry.setOwner(ROOT_NODE, newOwner, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Transfer')
          assert.equal(logs[0].args.node, ROOT_NODE)
          assert.equal(logs[0].args.owner, newOwner)
        })
      }

      describe('when the new owner to be set is a non-zero address', function () {
        assertItSetsTheOwner(anotherAddress)
      })

      describe('when the new owner to be set is a zero address', function () {
        assertItSetsTheOwner(ZERO_ADDRESS)
      })
    })

    describe('when the sender is not the owner of the contract', function () {
      const from = anotherAddress

      it('reverts', async function () {
        await assertRevert(this.registry.setOwner(ROOT_NODE, anotherAddress, { from }))
      })
    })
  })

  describe('creating subnodes', function () {
    const SUBNODE_LABEL = web3.sha3('SUBNODE')
    const SUBNODE = ENSNodeID(ROOT_NODE, SUBNODE_LABEL)

    describe('when the subnode was not registered yet', function () {
      it('has no owner', async function () {
        assert.equal(await this.registry.owner(SUBNODE), ZERO_ADDRESS)
      })
    })

    describe('while registering a new subnode', function () {
      describe('when the sender is the owner of the requested node', function () {
        const from = owner

        function assertItRegistersASubnode(newOwner) {
          it('registers a new subnode setting the given address as the owner', async function () {
            await this.registry.setSubnodeOwner(ROOT_NODE, SUBNODE_LABEL, newOwner, { from })

            assert.equal(await this.registry.owner(SUBNODE), newOwner)
          })

          it('does not set any other information of the subnode', async function () {
            await this.registry.setSubnodeOwner(ROOT_NODE, SUBNODE_LABEL, newOwner, { from })

            assert.equal(await this.registry.ttl(SUBNODE), 0)
            assert.equal(await this.registry.resolver(SUBNODE), ZERO_ADDRESS)
          })

          it('emits an event', async function () {
            const { logs } = await this.registry.setSubnodeOwner(ROOT_NODE, SUBNODE_LABEL, newOwner, { from })

            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, 'NewOwner')
            assert.equal(logs[0].args.node, ROOT_NODE)
            assert.equal(logs[0].args.label, SUBNODE_LABEL)
            assert.equal(logs[0].args.owner, newOwner)
          })
        }

        describe('when the new owner to be set is a non-zero address', function () {
          assertItRegistersASubnode(anotherAddress)
        })

        describe('when the new owner to be set is a zero address', function () {
          assertItRegistersASubnode(ZERO_ADDRESS)
        })
      })

      describe('when the sender is not the owner of the requested node', function () {
        const from = anotherAddress

        it('reverts', async function () {
          await assertRevert(this.registry.setSubnodeOwner(ROOT_NODE, SUBNODE, anotherAddress, { from }))
        })
      })
    })
  })

  describe('resolver', function () {
    const node = ROOT_NODE

    describe('when the resolver for the requested node was not set yet', function () {
      it('returns the zero address', async function () {
        assert.equal(await this.registry.resolver(node), ZERO_ADDRESS)
      })
    })

    describe('while setting the resolver for the requested node', function () {
      describe('when the sender is the owner of the requested node', function () {
        const from = owner

        function assertItSetsTheResolver(resolver) {
          it('sets the resolver of the requested node', async function () {
            await this.registry.setResolver(node, resolver, { from })

            assert.equal(await this.registry.resolver(node), resolver)
          })

          it('emits an event', async function () {
            const { logs } = await this.registry.setResolver(node, resolver, { from })

            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, 'NewResolver')
            assert.equal(logs[0].args.node, node)
            assert.equal(logs[0].args.resolver, resolver)
          })
        }

        describe('when the given resolver is a non-zero address', function () {
          assertItSetsTheResolver(resolverAddress)
        })

        describe('when the given resolver is a zero address', function () {
          assertItSetsTheResolver(ZERO_ADDRESS)
        })
      })

      describe('when the sender is not the owner of the requested node', function () {
        const from = anotherAddress

        it('reverts', async function () {
          await assertRevert(this.registry.setResolver(node, resolverAddress, { from }))
        })
      })
    })
  })

  describe('ttl', function () {
    const node = ROOT_NODE

    describe('when the TTL for the requested node was not set yet', function () {
      it('returns 0', async function () {
        assert.equal(await this.registry.ttl(node), 0)
      })
    })

    describe('while setting the TTL for the requested node', function () {
      const ttl = 10

      describe('when the sender is the owner of the requested node', function () {
        const from = owner

        it('sets the resolver of the requested node', async function () {
          await this.registry.setTTL(node, ttl, { from })

          assert.equal(await this.registry.ttl(node), ttl)
        })

        it('emits an event', async function () {
          const { logs } = await this.registry.setTTL(node, ttl, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'NewTTL')
          assert.equal(logs[0].args.node, node)
          assert.equal(logs[0].args.ttl, ttl)
        })
      })

      describe('when the sender is not the owner of the requested node', function () {
        const from = anotherAddress

        it('reverts', async function () {
          await assertRevert(this.registry.setTTL(node, ttl, { from }))
        })
      })
    })
  })
})
