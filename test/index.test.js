const expect = require("chai").expect;
const sinon = require("sinon");
const nock = require('nock');

const mongoDb = require('mongodb-memory-server').MongoMemoryServer;

const app = require("../app/");
const model = require("../app/model");
const testData = require("./testData");

const cfg = require("../config")

/** require app and test it 
 * if make request - nock request with nock ...
 * if store into data - mock model.save method
 * if store exact data - mock 
 */
// https://hackernoon.com/testing-node-js-in-2018-10a04dd77391

let mongoServer;

describe("Check whole flow", () => {
  let clock;
  before((done) => {
    /** mock - webrates request/response */
    nock(cfg.request.urlRoot)
      .get(/.*/)
      .reply(200, () => {
        return testData.okResponse;
      });

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

  it("Check if the stored objects in equal to input - 10", (done) => {
    app().then(async () => {
      const dbModel = model.getModel();

      const totalPairs = await dbModel.countDocuments();
      const pairs = await dbModel.find({});

      expect(totalPairs).to.equal(testData.expectedTotal);
      expect(pairs[0]).to.include(testData.expectedPair0);
      done();
    })
    .catch(async (err) => {
      const dbModel = model.getModel();
      const totalPairs = await dbModel.countDocuments();

      expect(totalPairs).to.equal(testData.expectedTotal);
      done();
    });
  });

  after(() => {
    clock.restore();
  });
});