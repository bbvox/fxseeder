const expect = require("chai").expect;
const sinon = require("sinon");
const nock = require('nock');

const mongoDb = require('mongodb-memory-server').MongoMemoryServer;

const app = require("../app/");
const model = require("../model");
const rateModel = require("../model/rate");

const testData = require("./testData");
const agrTestData = require("./agrTestData");

describe("Check aggregate cases: ", () => {
  let mongoServer;
  let clock;
  let dbModel;

  before((done) => {
    global.debug = () => { };

    clock = sinon.useFakeTimers({
      now: new Date(2019, 1, 1, 0, 16),
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

  // config.periods = ['15m', '1h', '4h' ...]
  // have allowedDelay - 60000mS(10m)
  it("Check FAIL when time is not divide by periods.", (done) => {
    clock = sinon.useFakeTimers({
      now: new Date(2019, 1, 1, 0, 11),
      shouldAdvanceTime: true,
      advanceTimeDelta: 20
    });

    app.aggregate()
      .then(done)
      .catch(failErr => {
        expect(failErr).to.deep.equal(testData.expectAgrFail);
        done();
      });
  });

  // and exit on second step 
  it("Check OK when periods is divide by 15min, ! but WITHOUT " +
    "\n\r data in source collection and exit on second check validateData", (done) => {
      // exit with 0
      app.aggregate()
        .then(() => {
          expect(true).to.be.true;
          done()
        })
        .catch(done);
    });

  // whole flow 
  // aggregate data from 1m period(collection) and store into 15m period
  it("Check OK when periods is divide by 15min.", (done) => {
    // 1. Insert blank data into mongoDB source collection - rates 
    // 2. Start app.aggregate
    // 3. Check mongoDb destination collection - rates15m

    // rates
    dbModel = rateModel.getModel("source", "15m");
    // rates15m
    const dbCheckModel = rateModel.getModel("destination", "15m");

    dbModel.insertMany(agrTestData.blankData).then(() => {
      app.aggregate()
        .then(() => {
          rateModel.getOnePair(3, dbCheckModel)
            .then(dataPairId3 => {
              // ugly copy because response contain other properties
              let pairId3 = JSON.parse(JSON.stringify(dataPairId3[0]));
              delete pairId3.published;

              expect(pairId3).to.deep.equal(agrTestData.expectedResult[0]);
              done()
            })
        })
        .catch(done);
    })
      .catch(done)
  });

  afterEach(() => {
    clock.restore();
    // mongoServer.stop();
  });

  after((done) => {
    // delete inserted records 
    dbModel.deleteMany({}, done)
  })
})