async function assertRevert(promise, errMsg) {
  try {
    if (typeof errMsg !== "undefined") {
      console.log(errMsg);
      const errMsgFound = errMsg.search('from the contract') >= 0;
      assert(errMsgFound, `Expected "reason provided from the contract", got ${errMsg} instead`);
    }
    await promise;
    assert.fail('Expected revert not received');
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0;
    assert(revertFound, `Expected "revert", got ${error} instead`);
  }
}

module.exports = assertRevert;
