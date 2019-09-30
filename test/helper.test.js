const expect = require("chai").expect;
const sinon = require("sinon");

const hlp = require("../app/helper");

describe("Check helper argument Check for Debug - argvCheckDebug method: ", () => {
  let logStub;
  before(() => {
    process.argv[2] = "--debug";
  });

  it("Check OK should set debugFlag to true, when pass arguments.", () => {
    // emulate passing parameters --debug
    hlp.argvCheckDebug();
    expect(hlp.isDebug()).to.be.true;
  });

  it("Check OK should console.log with errorData.", () => {
    logStub = sinon.stub(console, "log");

    hlp.argvCheckDebug();
    global.debug({ err: "message" }, "test");

    expect(logStub.calledTwice).to.be.true;
    expect(logStub.calledWith({ err: "message" })).to.be.true;
  });

  after(() => {
    logStub.restore();
    process.argv[2] = "--recursive";
  });
});
