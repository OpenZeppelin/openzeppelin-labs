const Child = artifacts.require('Child')
const BadChild = artifacts.require('BadChild')

async function assertRevert(promise) {
  try {
    await promise;
    assert.fail('Expected revert not received');
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0;
    assert(revertFound, `Expected "revert", got ${error} instead`);
  }
}

contract('Child', function ([owner]) {

  it('should initialize once', async function () {
    const child = await Child.new({ from: owner });
    await child.initialize(10, 20, 30, { from: owner });
    const a = await child.a();
    const b = await child.b();
    const c = await child.c();
    assert(a.eq(10));
    assert(b.eq(20));
    assert(c.eq(30));
  });

  it('should not initialize twice', async function () {
    const child = await Child.new({ from: owner });
    await child.initialize(10, 20, 30, { from: owner });
    await assertRevert(child.initialize(10, 20, 30, { from: owner }));
  });

});

contract('BadChild', function ([owner]) {

  it('should not work', async function () {
    const child = await BadChild.new({ from: owner });
    await assertRevert(child.initialize(10, 20, 30, { from: owner }));
  });

});
