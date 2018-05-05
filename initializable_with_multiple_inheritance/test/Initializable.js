const Child = artifacts.require('Child')

contract('Child', function ([owner]) {

  it('should work', async function () {
    const child = await Child.new({ from: owner });
    await child.initialize(10, 20, 30, { from: owner });
    const a = await child.a();
    const b = await child.b();
    const c = await child.c();
    assert(a.eq(10));
    assert(b.eq(20));
    assert(c.eq(30));
  })

})
