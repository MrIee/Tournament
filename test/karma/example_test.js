// Writing unit tests is entirely optional for the challenge.
// However we have included this unit test harness should you prefer to develop in a TDD environment.

// http://chaijs.com/api
// https://mochajs.org
// http://sinonjs.org/docs

describe('This test', function() {
  it('passes', function() {
    expect(2 + 2).to.equal(4);
  });

  it('supports spies', function() {
    var spy = sinon.spy();
    spy();
    expect(spy.callCount).to.equal(1);
  });

  it('supports stubs', function() {
    var stub = sinon.stub().returns(42);
    expect(stub()).to.equal(42);
  });
});
