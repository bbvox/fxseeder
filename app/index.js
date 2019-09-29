'use strict';

const http = require("./http")
const hlp = require("./helper")
const model = require("../model")
const rateModel = require("../model/rate")

// toDO fill rates collections
// move model.save here not in helper 
const feeder = () => {
  return model.connect()
    .then(http.getData)
    .then(model.save)
    .then(rateModel.saveData)
    .then(data => Promise.resolve(data))
    .catch(err => Promise.reject(err))
}

const aggregate = () => {
  return model.connect()
    .then(hlp.getPeriods)
    .then(periods =>
      Promise.all(periods.map(rateModel.aggregate)))
}

/**
 * 1. connect to mongoDB
 * 2. make request
 * 3. store to mongoDB
 */
module.exports = {
  feeder,
  aggregate
};