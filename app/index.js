'use strict';

const http = require("./http")
const hlp = require("./helper")
const model = require("../model")
const rateModel = require("../model/rate")

/**
 * 1. connect to mongoDB
 * 2. get data from source
 * 3. store into rrates collection
 * 4. store into rates collection
 */
const feeder = () => {
  return model.connect()
    .then(http.getData)
    .then(model.save)
    .then(rateModel.saveData)
}

/**
 * 1. connect
 * 2. getPeriod - ["15m", "1h", "4h"...]
 * 3. aggregate & save
 */
const aggregate = () => {
  return model.connect()
    .then(hlp.getPeriods)
    .then(periods =>
      Promise.all(periods.map(rateModel.aggregate)))
}

module.exports = {
  feeder,
  aggregate
};