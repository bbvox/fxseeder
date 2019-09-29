const expect = require("chai").expect;
const sinon = require("sinon");

const mongoDb = require('mongodb-memory-server').MongoMemoryServer;

const rate = require("../model/rate");
const testData = require("./testData");
const model = require("../model");

describe("Check Rate model methods: ", () => {
  let mongoServer;
  before((done) => {
    /** start inMemory mongoDB server ... */
    mongoServer = new mongoDb();
    mongoServer
      .getConnectionString()
      .then(model.connect)
      .then(done)
      .catch(done);
  });

  it("Check save should reformat and store it.", (done) => {
    rate.save(testData.inputRateSave)
      .then(dataSave => {
        rate.find({}).then(rates => {

          expect(rates.length).to.equal(testData.expectedRateLength);
          expect(rates[0]).to.include(testData.expectedRateSave);
          done();
        })
      })
      .catch(done);
  });

  after(() => {
    model.close();
  });
});
