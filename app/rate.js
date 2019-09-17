'use strict';
/**
 * Module dependencies.
 */
const mongoose = require('mongoose')

const cfg = require('../config')
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

let rateModel = mongoose.model('rate', rateSchema)

exportModel.ssave = function(ratesData) {
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
    rateModel.insertMany(saveData)
      .then(savedData => resolve(savedData), err => reject(err))
  })
}

module.exports = exportModel;