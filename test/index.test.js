const expect = require("chai").expect;
const sinon = require("sinon");
const nock = require("nock");

const mongoDb = require("mongodb-memory-server").MongoMemoryServer;

const app = require("../app/");
const model = require("../model");
const rateModel = require("../model/rate");
const testData = require("./testData");

const cfg = require("../config");

/** require app and test it
 * if make request - nock request with nock ...
 * if store into data - mock model.save method
 * if store exact data - mock
 */
// https://hackernoon.com/testing-node-js-in-2018-10a04dd77391

describe("Check request/response(req/res) cases: ", () => {
  let mongoServer;
  let clock;

  before(done => {
    global.debug = () => {};

    /** mock - setup fakeTimer */
    clock = sinon.useFakeTimers({
      now: new Date(2019, 1, 1, 0, 15),
      shouldAdvanceTime: true,
      advanceTimeDelta: 20
    });

    /** start inMemory mongoDB server ... */
    mongoServer = new mongoDb();
    mongoServer
      .getConnectionString()
      .then(model.connect)
      .then(done)
      .catch(done);
  });

  it("Check FAIL when req/res should return Error.", done => {
    nock(cfg.request.urlRoot)
      .get(/.*/)
      .replyWithError({});
    app
      .feeder()
      .then(done)
      .catch(failErr => {
        expect(failErr).to.deep.equal(testData.expectedFail1);
        done();
      });
  });

  it("Check FAIL when req/res is short(invalid).", done => {
    nock(cfg.request.urlRoot)
      .get(/.*/)
      .reply(200, "Short response");

    app
      .feeder()
      .then(done)
      .catch(emptyErr => {
        expect(emptyErr).to.deep.equal(testData.expectedFail2);
        done();
      });
  });

  after(done => {
    clock.restore();
    // clear collection after operation
    rateModel.deleteAll().then(done);
    // mongoServer.stop();
  });
});
