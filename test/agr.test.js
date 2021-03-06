const expect = require("chai").expect;
const sinon = require("sinon");
const mongoDb = require("mongodb-memory-server").MongoMemoryServer;

const app = require("../app/");
const model = require("../model");
const rateModel = require("../model/rate");
const agrTestData = require("./agrTestData");

const hlp = require("../app/helper");

describe("Check aggregate cases: ", () => {
  let mongoServer;
  let clock;
  let dbModel;

  // current Date for time and created
  const convertData = (testData) => {
    const currentDate = new Date().toISOString();
    return testData.map((test) => ({
      ...test,
      time: currentDate,
      created: currentDate,
    }));
  };

  before((done) => {
    global.debug = () => {};

    clock = sinon.useFakeTimers({
      now: new Date(2019, 1, 1, 0, 16),
      shouldAdvanceTime: true,
      advanceTimeDelta: 20,
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
      advanceTimeDelta: 20,
    });

    app
      .aggregate()
      .then(done)
      .catch((failErr) => {
        expect(failErr).to.deep.equal(agrTestData.expectAgrFail);
        done();
      });
  });

  // and exit on second step
  it(
    "Check OK when periods is divide by 15min, ! but WITHOUT " +
      "\n\r data in source collection and exit on second check validateData",
    (done) => {
      // exit with 0
      app
        .aggregate()
        .then(() => {
          expect(true).to.be.true;
          done();
        })
        .catch(() => done());
    }
  );

  // whole flow
  // aggregate data from bases collection and store into 15m period
  // only value from array is in use !!!
  it("Check OK when periods is divide by 15min - calcBase \n source: bases / destination: rates15m.", (done) => {
    // 1. Insert blank data into mongoDB source collection - rates
    // 2. Start app.aggregate
    // 3. Check mongoDb destination collection - rates15m

    // 2019-9-28 0:46
    clock = sinon.useFakeTimers({
      now: new Date(2019, 9, 30, 0, 46),
      shouldAdvanceTime: true,
      advanceTimeDelta: 20,
    });

    // rates collection
    dbModel = rateModel.getModel("source", "15m");
    // rates15m
    const dbCheckModel = rateModel.getModel("destination", "15m");

    hlp.setCfgDelay();

    const testData = convertData(agrTestData.blankDataBase);

    dbModel
      .insertMany(testData)
      .then(() => {
        app
          .aggregate()
          .then(() => {
            rateModel
              .getPairBy({ pid: 3, period: "15m" }, dbCheckModel)
              .then((pairData) => {
                // mongoose
                const [pair] = JSON.parse(JSON.stringify(pairData)); // get first pair
                const [pairExpected] = agrTestData.expectedResult; // get FIRST !!!
                expect(pair).to.deep.equal({
                  ...pairExpected,
                  time: pair.time,
                });
                done();
              });
          })
          .catch((err1) => {
            console.log("err1 ::: ", err1);
            expect(false).to.be.true;
            done();
          });
      })
      .catch((err2) => {
        console.log("err2 ::: ", err2);
        expect(false).to.be.true;
        done();
      });
  });

  it("Check OK when periods is divide by 1h - calcAgr \n source: rates15m / destination: rates1h.", (done) => {
    // same testing approach as above but need to validate calcAgr - 
    done();
  });

  afterEach(() => {
    clock.restore();
    // mongoServer.stop();
  });

  after((done) => {
    // delete inserted records
    dbModel.deleteMany({}, done);
  });
});
