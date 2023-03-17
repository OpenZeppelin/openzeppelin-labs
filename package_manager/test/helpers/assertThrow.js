export default async function assertRevert(promise) {
  try {
    await promise
    assert.fail('Expected throw not received')
  } catch (error) {
    const revertFound = error.message.search('invalid opcode') >= 0
    assert(revertFound, `Expected "invalid opcode", got ${error} instead`)
  }
}
