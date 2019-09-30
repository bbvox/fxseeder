const expect = require("chai").expect;
const sinon = require("sinon");

const model = require("../model");
const testData = require("./testData");

describe("Check General model methods: ", () => {
  let clock;

  before(() => {
    clock = sinon.useFakeTimers({
      now: new Date(2019, 1, 1, 0, 10),
      shouldAdvanceTime: true,
      advanceTimeDelta: 20
    });
  });

  it("CheckMinutes FAIL should return reject / error.", done => {
    model
      .checkMinutes()
      .then(done)
      .catch(failErr => {
        expect(failErr).to.deep.equal(testData.modelFail1);
        done();
      });
  });

  it("Check OHLC Open/High/Low/Close.", () => {
    const orderedOHLC = model.ohlc(testData.inputOHLC);

    expect(orderedOHLC).to.deep.equal(testData.expectedOHLC);
  });

  it("Check orderById - return object.", () => {
    const orderedObject = model.orderById(testData.inputOrderById);

    expect(orderedObject).to.deep.equal(testData.expectedOrderById);
  });

  after(() => {
    clock.restore();
  });
});
