'use strict';

const mongoose = require('mongoose');

const model = require('./');
const cfg = require('../config');

/************************************
 *    ALL RATES MODEL here          *
 *    - rates15m                    *
 *    - rates1h                     *
 *    - rates4h                     *
 *    - rates1d                     *
 *    - rates1w                     *
 *                                  *
 *    - rates                       *
 ************************************/

const exportModel = {};

const ratesSchema = new mongoose.Schema(cfg.mongo.rateSchema);

// 1. find
// 2. aggregate
// 3. save
exportModel.aggregate = (period) => {
  const srcModel = exportModel.getModel("source", period);
  const destModel = exportModel.getModel("destination", period);

  global.debug && global.debug(period, "Aggregate period");

  return exportModel.getData(srcModel)
    .then(exportModel.validateData)
    .then(exportModel.calcAgr)
    .then((aggregateData) => exportModel.saveData(aggregateData, destModel))
    .catch(err => {
      // resolve to go on with promise.all from upper layer
      if (err.code === 1) {
        global.debug && global.debug(err, "Aggregate root function");
        return Promise.resolve();
      } else {
        return Promise.reject();
      }
    })
}

// Check if some of the promises return empty result
// and return copy of the data
exportModel.validateData = (sourceData) => {
  let isValid = true;

  sourceData.forEach(data => {
    if (!data.length) {
      isValid = false;
    }
  });
  return isValid
    ? Promise.resolve(JSON.parse(JSON.stringify(sourceData)))
    : Promise.reject({ err: "Empty response from query", code: 1 });
}

// get source DATA ....
exportModel.getData = (model) => {
  const { pairs } = cfg;
  const promises = [];

  for (let pkey in pairs) {
    promises.push(exportModel.getOnePair(pairs[pkey], model));
  }

  return Promise.all(promises);
}

// find rates for one period one pairId
// toDO explicitly set limit for created ---
exportModel.getOnePair = (pairId, model) => {
  return model.find({ pairId }).select({ _id: 0, created: 0 }).limit(5).exec();
}

exportModel.calcAgr = (pairsArray) => {
  if (!pairsArray.length) {
    return Promise.reject({ err: "Empty source records ." });
  }
  let agrPairs = [];
  pairsArray.forEach((pair, idx) => {
    agrPairs[idx] = {
      ...pair[0]
    };

    pair.forEach(one => {
      (agrPairs[idx].high < one.high) && (agrPairs[idx].high = one.high);
      (agrPairs[idx].low < one.low) && (agrPairs[idx].low = one.low);
    });
  })

  return Promise.resolve(agrPairs);
}

// save to destination Collection
exportModel.saveData = (agrData, model) =>
  (model.insertMany(agrData))

exportModel.getModel = (modelType, period) => {
  const dbclient = model.getClient();
  if (modelType === "source") {
    return dbclient.model(cfg.collections.source[period], ratesSchema, cfg.collections.source[period]);
  } else if (modelType === "destination") {
    return dbclient.model(cfg.collections.destination[period], ratesSchema, cfg.collections.destination[period]);
  }
}

/** OLD ................... */
const getModel = () => {
  const dbClient = model.getClient();
  return dbClient.model("rate", ratesSchema);
}

exportModel.find = (query) => {
  const rateModel = getModel();
  return rateModel.find(query);
}

exportModel.save = function (ratesData) {
  let pairId, rate, rateDoc = {},
    saveData = [];
  global.debug && global.debug(ratesData.length, "Rate save data length");

  // array of names ["USD/EUR", ....]
  const pairsName = Object.keys(cfg.pairs);

  for (var i in ratesData) {
    pairId = i.substr(2)
    rate = ratesData[i]
    rateDoc = {
      pairId: pairId,
      pairName: pairsName[pairId],
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