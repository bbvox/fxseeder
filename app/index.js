"use strict";

const http = require("./http");
const hlp = require("./helper");
const model = require("../model/index");
const rateModel = require("../model/rate");

/**
 * 1. connect to mongoDB
 * 2. get data from source
 * 3. store into rates collection
 */
const feeder = () => {
  return model.connect().then(http.getData).then(rateModel.saveData);
};

/**
 * 1. connect
 * 2. getPeriod - ["15m", "1h", "4h"...]
 * 3. aggregate per pair per period & save
 */
const aggregate = () => {
  return model
    .connect()
    .then(hlp.getPeriods)
    .then((periods) => Promise.all(periods.map(rateModel.aggregate)));
  // .then(periods => rateModel.aggregate('15m'));
};

module.exports = {
  feeder,
  aggregate,
};
