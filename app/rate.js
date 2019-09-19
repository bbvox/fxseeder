'use strict';
/**
 * Module dependencies.
 */
const mongoose = require('mongoose')

const cfg = require('../config')
const model = require('./model')
const Schema = mongoose.Schema
const exportModel = {};

const rateSchema = new Schema({
  pairId: { type: Number, max: 200 },
  pairName: String,
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  created: { type: Date, default: Date.now }
})

const getModel = () => {
  const dbClient = model.getClient();
  return dbClient.model("rate", rateSchema);
}

exportModel.find = (query) => {
  const rateModel = getModel();
  return rateModel.find(query);
}

exportModel.save = function (ratesData) {
  let pairId, rate, rateDoc = {},
    saveData = [];

  for (var i in ratesData) {
    pairId = i.substr(2)
    rate = ratesData[i]
    rateDoc = {
      pairId: pairId,
      pairName: cfg.pairs[pairId],
      open: rate.open,
      high: rate.max,
      low: rate.min,
      close: rate.close
    }
    saveData.push(rateDoc)
  }

  return new Promise((resolve, reject) => {
    const rateModel = getModel();
    rateModel.insertMany(saveData)
      .then(resolve)
      .catch(reject);
  })
}

module.exports = exportModel;