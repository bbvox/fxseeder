const expect = require("chai").expect;
const sinon = require("sinon");
const nock = require('nock');

const mongoDb = require('mongodb-memory-server').MongoMemoryServer;

const model = require("../app/model");
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

  // it("Check if connect return reject / error.", (done) => {
  //   model.connect()
  //     .then(done)
  //     .catch((connErr) => {
  //       console.log("----", connErr);
  //       // expect(failErr).to.deep.equal(testData.modelFail1);
  //       done();
  //     });
  // });


  it("CheckMinutes FAIL should return reject / error.", (done) => {
    model.checkMinutes()
      .then(done)
      .catch((failErr) => {
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