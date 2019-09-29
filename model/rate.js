'use strict';

const mongoose = require('mongoose');

const model = require('./');
const cfg = require('../config');

/************************************
 *    rate.METHODS - MAIN           *
 *    - aggregate                   *
 *    -- getData                    *
 *    -- validateData               *
 *    -- calcAgr                    *
 *    -- saveAgrData                *
 *                                  *
 ************************************/

const exportModel = {};

const ratesSchema = new mongoose.Schema(cfg.mongo.rateSchema);

/**
 * 1. getData - find from source collection
 * 2. validateData - check every pairs return result & deep copy of data
 * 3. calcAgr - calculate aggregate data
 * 4. saveAgrData - save aggregate data into destination collection
 */
exportModel.aggregate = (period) => {
  const srcModel = exportModel.getModel("source", period);
  const destModel = exportModel.getModel("destination", period);

  global.debug && global.debug(period, "Aggregate period");

  return exportModel.getData(srcModel)
    .then(exportModel.validateData)
    .then(exportModel.calcAgr)
    .then((aggregateData) => exportModel.saveAgrData(aggregateData, destModel))
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

// get source DATA ....
exportModel.getData = (model) => {
  const { pairs } = cfg;
  const promises = [];
  for (let pkey in pairs) {
    promises.push(exportModel.getOnePair(pairs[pkey], model));
  }

  return Promise.all(promises);
}

// find rates for one period one sid / pairID
// toDO explicitly set limit for created ---
// toDO remove limit
// ! ! !
exportModel.getOnePair = (sid, model) => {
  return model.find({ sid }).select({ _id: 0, created: 0 }).limit(5).exec();
}

// Check if some of the promises return empty result
// and return copy of the data
exportModel.validateData = (sourceData) => {
  let isValid = true;

  if (!sourceData.length) {
    isValid = false;
  } else {
    sourceData.forEach(pairData => {
      if (!pairData.length) {
        isValid = false;
      }
    });
  }
  return isValid
    ? Promise.resolve(JSON.parse(JSON.stringify(sourceData)))
    : Promise.reject({ err: "Empty response from query", code: 1 });
}

/**
 * calcAgr
 * calculate aggregate data based pairsArray
 * @param {array} - source data
 * 
 * @returns {Promise} - with aggregate data
 */
exportModel.calcAgr = (pairsArray) => {
  let agrPairs = [];
  pairsArray.forEach((pair, idx) => {
    agrPairs[idx] = {
      ...pair[0]
    };

    pair.forEach(one => {
      (agrPairs[idx].high < one.high) && (agrPairs[idx].high = one.high);
      (agrPairs[idx].low > one.low) && (agrPairs[idx].low = one.low);

      agrPairs[idx].close = one.close;
    });
  })

  return Promise.resolve(agrPairs);
}

// save to destination Collection
exportModel.saveAgrData = (agrData, model) =>
  (model.insertMany(agrData))

exportModel.getModel = (modelType, period) => {
  const dbclient = model.getClient();
  if (modelType === "source") {
    return dbclient.model(cfg.collections.source[period], ratesSchema, cfg.collections.source[period]);
  } else if (modelType === "destination") {
    return dbclient.model(cfg.collections.destination[period], ratesSchema, cfg.collections.destination[period]);
  } else {
    return dbclient.model("rates", ratesSchema);
  }
}

// save RATES data 
exportModel.saveData = (ratesData) => {
  const dbModel = exportModel.getModel();
  // add sid
  const rates = ratesData.map(rate =>
    ({ sid: cfg.pairs[rate.symbol], ...rate }));

  return dbModel.insertMany(rates);
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
  let symbolId, rate, rateDoc = {},
    saveData = [];
  global.debug && global.debug(ratesData.length, "Rate save data length");

  // array of names ["USD/EUR", ....]
  const pairsName = Object.keys(cfg.pairs);

  for (var i in ratesData) {
    symbolId = i.substr(2)
    rate = ratesData[i]
    rateDoc = {
      sid: symbolId,
      symbol: pairsName[symbolId],
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

exportModel.deleteAll = () => {
  return new Promise((res, rej) => {
    getModel().deleteMany({}, () => {
      res();
    });
  })
}

module.exports = exportModel;