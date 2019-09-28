const expect = require("chai").expect;
const sinon = require("sinon");

const hlp = require("../app/helper");

describe("Check helper argument Check for Debug - argvCheckDebug method: ", () => {
  before(() => {
    process.argv[2] = "--debug";
  });

  it("Check OK should set debugFlag to true, when pass arguments.", () => {
    // emulate passing parameters --debug
    hlp.argvCheckDebug();
    expect(hlp.isDebug()).to.be.true;
  });

  it("Check OK should console.log with errorData.", () => {
    sinon.stub(console, 'log');

    hlp.argvCheckDebug();
    global.debug({ err: "message" }, "test");

    expect(console.log.calledTwice).to.be.true;
    expect(console.log.calledWith({ err: "message" })).to.be.true;
  });
});