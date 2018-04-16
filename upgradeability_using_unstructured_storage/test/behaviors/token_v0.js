function shouldBehaveLikeTokenV0(proxyOwner, tokenOwner, owner, recipient, anotherAccount) {
  const assertRevert = require('../helpers/assertRevert')
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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

  describe('mint', function () {
    const amount = 100

    describe('when the sender is the token owner', function () {
      const from = tokenOwner

      it('mints the requested amount', async function () {
        await this.token.mint(owner, amount, { from })

        const balance = await this.token.balanceOf(owner)
        assert.equal(balance, amount)
      })
    })

    describe('when the sender is not the token owner', function () {
      const from = anotherAccount

      it('reverts', async function () {
        await assertRevert(this.token.mint(owner, amount, { from }))
      })
    })
  })

  describe('total supply', function () {
    describe('when there are no tokens', function () {
      it('returns zero', async function () {
        const totalSupply = await this.token.totalSupply()

        assert.equal(totalSupply, 0)
      })
    })

    describe('when there are some tokens', function () {
      beforeEach(async function () {
        await this.token.mint(owner, 100, { from: tokenOwner })
      })

      it('returns the total amount of tokens', async function () {
        const totalSupply = await this.token.totalSupply()

        assert.equal(totalSupply, 100)
      })
    })
  })

  describe('balanceOf', function () {
    describe('when the requested account has no tokens', function () {
      it('returns zero', async function () {
        const balance = await this.token.balanceOf(owner)

        assert.equal(balance, 0)
      })
    })

    describe('when the requested account has some tokens', function () {
      beforeEach(async function () {
        await this.token.mint(owner, 100, { from: tokenOwner })
      })

      it('returns the total amount of tokens', async function () {
        const balance = await this.token.balanceOf(owner)

        assert.equal(balance, 100)
      })
    })
  })

  describe('transfer', function () {
    const amount = 100

    describe('when the recipient is not the zero address', function () {
      const to = recipient

      describe('when the sender does not have enough balance', function () {
        beforeEach(async function () {
          await this.token.mint(owner, amount - 1, { from: tokenOwner })
        })

        it('reverts', async function () {
          await assertRevert(this.token.transfer(to, amount, { from: owner }))
        })
      })

      describe('when the sender has enough balance', function () {
        beforeEach(async function () {
          await this.token.mint(owner, amount, { from: tokenOwner })
        })

        it('transfer the requested amount', async function () {
          await this.token.transfer(to, amount, { from: owner })

          const senderBalance = await this.token.balanceOf(owner)
          assert.equal(senderBalance, 0)

          const recipientBalance = await this.token.balanceOf(to)
          assert.equal(recipientBalance, amount)
        })

        it('emits a transfer event', async function () {
          const { logs } = await this.token.transfer(to, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Transfer')
          assert.equal(logs[0].args.from, owner)
          assert.equal(logs[0].args.to, to)
          assert(logs[0].args.value.eq(amount))
        })
      })
    })

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS

      it('reverts', async function () {
        await assertRevert(this.token.transfer(to, 100, { from: owner }))
      })
    })
  })

  describe('approve', function () {
    const amount = 100

    describe('when the spender is not the zero address', function () {
      const spender = recipient

      describe('when the sender has enough balance', function () {
        beforeEach(async function () {
          await this.token.mint(owner, amount, { from: tokenOwner })
        })

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(spender, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Approval')
          assert.equal(logs[0].args.owner, owner)
          assert.equal(logs[0].args.spender, spender)
          assert(logs[0].args.value.eq(amount))
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, amount)
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner })
          })

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, amount)
          })
        })
      })

      describe('when the sender does not have enough balance', function () {
        beforeEach(async function () {
          await this.token.mint(owner, amount - 1, { from: tokenOwner })
        })

        it('emits an approval event', async function () {
          const { logs } = await this.token.approve(spender, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Approval')
          assert.equal(logs[0].args.owner, owner)
          assert.equal(logs[0].args.spender, spender)
          assert(logs[0].args.value.eq(amount))
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.approve(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, amount)
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner })
          })

          it('approves the requested amount and replaces the previous one', async function () {
            await this.token.approve(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, amount)
          })
        })
      })
    })

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS

      beforeEach(async function () {
        await this.token.mint(owner, amount, { from: tokenOwner })
      })

      it('approves the requested amount', async function () {
        await this.token.approve(spender, amount, { from: owner })

        const allowance = await this.token.allowance(owner, spender)
        assert.equal(allowance, amount)
      })

      it('emits an approval event', async function () {
        const { logs } = await this.token.approve(spender, amount, { from: owner })

        assert.equal(logs.length, 1)
        assert.equal(logs[0].event, 'Approval')
        assert.equal(logs[0].args.owner, owner)
        assert.equal(logs[0].args.spender, spender)
        assert(logs[0].args.value.eq(amount))
      })
    })
  })

  describe('transfer from', function () {
    const amount = 100
    const spender = recipient

    describe('when the recipient is not the zero address', function () {
      const to = anotherAccount

      describe('when the spender has enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, amount, { from: owner })
        })

        describe('when the owner has enough balance', function () {
          beforeEach(async function () {
            await this.token.mint(owner, amount, { from: tokenOwner })
          })

          it('transfer the requested amount', async function () {
            await this.token.transferFrom(owner, to, amount, { from: spender })

            const senderBalance = await this.token.balanceOf(owner)
            assert.equal(senderBalance, 0)

            const recipientBalance = await this.token.balanceOf(to)
            assert.equal(recipientBalance, amount)
          })

          it('decreases the spender allowance', async function () {
            await this.token.transferFrom(owner, to, amount, { from: spender })

            const allowance = await this.token.allowance(owner, spender)
            assert(allowance.eq(0))
          })

          it('emits a transfer event', async function () {
            const {logs} = await this.token.transferFrom(owner, to, amount, { from: spender })

            assert.equal(logs.length, 1)
            assert.equal(logs[0].event, 'Transfer')
            assert.equal(logs[0].args.from, owner)
            assert.equal(logs[0].args.to, to)
            assert(logs[0].args.value.eq(amount))
          })
        })

        describe('when the owner does not have enough balance', function () {
          beforeEach(async function () {
            await this.token.mint(owner, amount - 1, { from: tokenOwner })
          })

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }))
          })
        })
      })

      describe('when the spender does not have enough approved balance', function () {
        beforeEach(async function () {
          await this.token.approve(spender, amount - 1, { from: owner })
        })

        describe('when the owner has enough balance', function () {
          beforeEach(async function () {
            await this.token.mint(owner, amount, { from: tokenOwner })
          })

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }))
          })
        })

        describe('when the owner does not have enough balance', function () {
          beforeEach(async function () {
            await this.token.mint(owner, amount - 1, { from: tokenOwner })
          })

          it('reverts', async function () {
            await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }))
          })
        })
      })
    })

    describe('when the recipient is the zero address', function () {
      const to = ZERO_ADDRESS

      beforeEach(async function () {
        await this.token.mint(owner, amount, { from: tokenOwner })
        await this.token.approve(spender, amount, { from: owner })
      })

      it('reverts', async function () {
        await assertRevert(this.token.transferFrom(owner, to, amount, { from: spender }))
      })
    })
  })

  describe('decrease approval', function () {
    const amount = 100

    describe('when the spender is not the zero address', function () {
      const spender = recipient

      describe('when the sender has enough balance', function () {
        beforeEach(async function () {
          await this.token.mint(owner, amount, { from: tokenOwner })
        })

        it('emits an approval event', async function () {
          const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Approval')
          assert.equal(logs[0].args.owner, owner)
          assert.equal(logs[0].args.spender, spender)
          assert(logs[0].args.value.eq(0))
        })

        describe('when there was no approved amount before', function () {
          it('keeps the allowance to zero', async function () {
            await this.token.decreaseApproval(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, 0)
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, amount + 1, { from: owner })
          })

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseApproval(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, 1)
          })
        })
      })

      describe('when the sender does not have enough balance', function () {
        beforeEach(async function () {
          await this.token.mint(owner, amount - 1, { from: tokenOwner })
        })

        it('emits an approval event', async function () {
          const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Approval')
          assert.equal(logs[0].args.owner, owner)
          assert.equal(logs[0].args.spender, spender)
          assert(logs[0].args.value.eq(0))
        })

        describe('when there was no approved amount before', function () {
          it('keeps the allowance to zero', async function () {
            await this.token.decreaseApproval(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, 0)
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, amount + 1, { from: owner })
          })

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseApproval(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, 1)
          })
        })
      })
    })

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS

      beforeEach(async function () {
        await this.token.mint(owner, amount, { from: tokenOwner })
      })

      it('decreases the requested amount', async function () {
        await this.token.decreaseApproval(spender, amount, { from: owner })

        const allowance = await this.token.allowance(owner, spender)
        assert.equal(allowance, 0)
      })

      it('emits an approval event', async function () {
        const { logs } = await this.token.decreaseApproval(spender, amount, { from: owner })

        assert.equal(logs.length, 1)
        assert.equal(logs[0].event, 'Approval')
        assert.equal(logs[0].args.owner, owner)
        assert.equal(logs[0].args.spender, spender)
        assert(logs[0].args.value.eq(0))
      })
    })
  })

  describe('increase approval', function () {
    const amount = 100

    describe('when the spender is not the zero address', function () {
      const spender = recipient

      describe('when the sender has enough balance', function () {
        beforeEach(async function () {
          await this.token.mint(owner, amount, { from: tokenOwner })
        })

        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseApproval(spender, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Approval')
          assert.equal(logs[0].args.owner, owner)
          assert.equal(logs[0].args.spender, spender)
          assert(logs[0].args.value.eq(amount))
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, amount)
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner })
          })

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, amount + 1)
          })
        })
      })

      describe('when the sender does not have enough balance', function () {
        beforeEach(async function () {
          await this.token.mint(owner, amount - 1, { from: tokenOwner })
        })

        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseApproval(spender, amount, { from: owner })

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'Approval')
          assert.equal(logs[0].args.owner, owner)
          assert.equal(logs[0].args.spender, spender)
          assert(logs[0].args.value.eq(amount))
        })

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, amount)
          })
        })

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, 1, { from: owner })
          })

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseApproval(spender, amount, { from: owner })

            const allowance = await this.token.allowance(owner, spender)
            assert.equal(allowance, amount + 1)
          })
        })
      })
    })

    describe('when the spender is the zero address', function () {
      const spender = ZERO_ADDRESS

      beforeEach(async function () {
        await this.token.mint(owner, amount, { from: tokenOwner })
      })

      it('approves the requested amount', async function () {
        await this.token.increaseApproval(spender, amount, { from: owner })

        const allowance = await this.token.allowance(owner, spender)
        assert.equal(allowance, amount)
      })

      it('emits an approval event', async function () {
        const { logs } = await this.token.increaseApproval(spender, amount, { from: owner })

        assert.equal(logs.length, 1)
        assert.equal(logs[0].event, 'Approval')
        assert.equal(logs[0].args.owner, owner)
        assert.equal(logs[0].args.spender, spender)
        assert(logs[0].args.value.eq(amount))
      })
    })
  })
}

module.exports = shouldBehaveLikeTokenV0
