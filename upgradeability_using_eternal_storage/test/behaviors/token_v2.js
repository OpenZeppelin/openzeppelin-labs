function shouldBehaveLikeTokenV2(tokenOwner, owner) {
  const assertRevert = require('../helpers/assertRevert')

  describe('burn', function () {
    const from = owner

    beforeEach(async function () {
      await this.token.mint(owner, 100, { from: tokenOwner })
    })

    describe('when the given amount is not greater than balance of the sender', function () {
      const amount = 100

      it('burns the requested amount', async function () {
        await this.token.burn(amount, { from })

        const balance = await this.token.balanceOf(from)
        assert.equal(balance, 0)
      })

      it('emits a burn event', async function () {
        const { logs } = await this.token.burn(amount, { from })

        assert.equal(logs.length, 1)
        assert.equal(logs[0].event, 'Burn')
        assert.equal(logs[0].args.burner, owner)
        assert.equal(logs[0].args.value, amount)
      })
    })

    describe('when the given amount is greater than the balance of the sender', function () {
      const amount = 101

      it('reverts', async function () {
        await assertRevert(this.token.burn(amount, { from }))
      })
    })
  })
}

module.exports = shouldBehaveLikeTokenV2
