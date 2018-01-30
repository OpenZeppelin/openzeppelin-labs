function shouldBehaveLikeTokenV1(proxyOwner, tokenOwner, owner, anotherAccount) {
  const assertRevert = require('../helpers/assertRevert')

  describe('initialize', function () {
    it('can not be initialized twice', async function () {
      await assertRevert(this.token.initialize(anotherAccount))
    })
  })

  describe('owner', function () {
    it('has an owner', async function () {
      const owner = await this.token.owner()

      assert.equal(owner, tokenOwner)
    })
  })

  describe('transfer ownership', function () {
    describe('when the new proposed owner is not the zero address', function () {
      const newOwner = anotherAccount

      describe('when the sender is the token owner', function () {
        const from = tokenOwner

        it('transfers the ownership', async function () {
          await this.token.transferOwnership(newOwner, { from })

          const owner = await this.token.owner()
          assert.equal(owner, anotherAccount)
        })

        it('emits an event', async function () {
          const { logs } = await this.token.transferOwnership(newOwner, { from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'OwnershipTransferred')
          assert.equal(logs[0].args.previousOwner, tokenOwner)
          assert.equal(logs[0].args.newOwner, newOwner)
        })
      })

      describe('when the sender is the proxy owner', function () {
        const from = proxyOwner

        it('reverts', async function () {
          await assertRevert(this.token.transferOwnership(newOwner, { from }))
        })
      })

      describe('when the sender is not the owner', function () {
        const from = anotherAccount

        it('reverts', async function () {
          await assertRevert(this.token.transferOwnership(newOwner, { from }))
        })
      })
    })

    describe('when the new proposed owner is the zero address', function () {
      const newOwner = 0x0

      it('reverts', async function () {
        await assertRevert(this.token.transferOwnership(newOwner, { from: tokenOwner }))
      })
    })
  })

  describe('minting finished', function () {
    describe('when the token is not finished', function () {
      it('returns false', async function () {
        const mintingFinished = await this.token.mintingFinished()
        assert.equal(mintingFinished, false)
      })
    })

    describe('when the token is finished', function () {
      beforeEach(async function () {
        await this.token.finishMinting({ from: tokenOwner })
      })

      it('returns true', async function () {
        const mintingFinished = await this.token.mintingFinished.call()
        assert.equal(mintingFinished, true)
      })
    })
  })

  describe('finish minting', function () {
    describe('when the sender is the token owner', function () {
      const from = tokenOwner

      describe('when the token was not finished', function () {
        it('finishes token minting', async function () {
          await this.token.finishMinting({ from })

          const mintingFinished = await this.token.mintingFinished()
          assert.equal(mintingFinished, true)
        })

        it('emits a mint finished event', async function () {
          const { logs } = await this.token.finishMinting({ from })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'MintFinished')
        })
      })

      describe('when the token was already finished', function () {
        beforeEach(async function () {
          await this.token.finishMinting({ from })
        })

        it('reverts', async function () {
          await assertRevert(this.token.finishMinting({ from }))
        })
      })
    })

    describe('when the sender is not the token owner', function () {
      const from = anotherAccount

      describe('when the token was not finished', function () {
        it('reverts', async function () {
          await assertRevert(this.token.finishMinting({ from }))
        })
      })

      describe('when the token was already finished', function () {
        beforeEach(async function () {
          await this.token.finishMinting({ from: tokenOwner })
        })

        it('reverts', async function () {
          await assertRevert(this.token.finishMinting({ from }))
        })
      })
    })
  })

  describe('mint', function () {
    const amount = 100

    describe('when the sender is the token owner', function () {
      const from = tokenOwner

      describe('when the token was not finished', function () {
        it('mints the requested amount', async function () {
          await this.token.mint(owner, amount, { from })

          const balance = await this.token.balanceOf(owner)
          assert.equal(balance, amount)
        })

        it('emits a mint finished event', async function () {
          const { logs } = await this.token.mint(owner, amount, { from })

          assert.equal(logs.length, 2)
          assert.equal(logs[0].event, 'Transfer')
          assert.equal(logs[1].event, 'Mint')
          assert.equal(logs[1].args.to, owner)
          assert.equal(logs[1].args.amount, amount)
        })
      })

      describe('when the token minting is finished', function () {
        beforeEach(async function () {
          await this.token.finishMinting({ from })
        })

        it('reverts', async function () {
          await assertRevert(this.token.mint(owner, amount, { from }))
        })
      })
    })

    describe('when the sender is not the token owner', function () {
      const from = anotherAccount

      describe('when the token was not finished', function () {
        it('reverts', async function () {
          await assertRevert(this.token.mint(owner, amount, { from }))
        })
      })

      describe('when the token was already finished', function () {
        beforeEach(async function () {
          await this.token.finishMinting({ from: tokenOwner })
        })

        it('reverts', async function () {
          await assertRevert(this.token.mint(owner, amount, { from }))
        })
      })
    })
  })
}

module.exports = shouldBehaveLikeTokenV1
