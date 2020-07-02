"use strict";

const mongoose = require("mongoose");

const model = require("./index");
const cfg = require("../config");

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

const baseSchema = new mongoose.Schema(cfg.mongo.baseSchema);
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

  return exportModel
    .getData(srcModel, period)
    .then(exportModel.validateData)
    .then((pairs) => exportModel.calcAgr(pairs, period))
    .then((aggregateData) => exportModel.saveAgrData(aggregateData, destModel))
    .catch((err) => {
      console.log("ERROR :::", err);
      // resolve to go on with promise.all from upper layer
      if (err.code === 1) {
        global.debug && global.debug(err, "Aggregate root function");
        return Promise.resolve();
      } else {
        return Promise.reject();
      }
    });
};

// get source DATA ....
exportModel.getData = (model, period) => {
  const { pairs } = cfg;
  const promises = [];
  for (let pkey in pairs) {
    promises.push(exportModel.getPairBy({ pid: pairs[pkey], period }, model));
  }

  return Promise.all(promises);
};

// find pair rates by pid(pairID) & period
// toDO remove limit - if
exportModel.getPairBy = ({ pid, period }, model) => {
  // start From now - period time - 1m (execution)
  const startFrom = new Date().getTime() - cfg.periods[period] - 60000;
  const query = {
    pid,
    created: { $gte: new Date(startFrom).toISOString() },
  };
  return model.find(query).select({ _id: 0, created: 0 }).limit(7).exec();
};

// Check if some of the promises return empty result
// and return copy of the data
exportModel.validateData = (sourceData) => {
  let isValid = true;
  if (!sourceData.length) {
    isValid = false;
  } else {
    sourceData.forEach((pairData) => {
      if (!pairData.length) {
        isValid = false;
      }
    });
  }
  return isValid
    ? Promise.resolve(JSON.parse(JSON.stringify(sourceData)))
    : Promise.reject({ err: "Empty response from query", code: 1 });
};

/**
 * calcAgr
 * calculate aggregate data based pairs
 * @param {array} - pairs source data
 * @param {string} - period
 *
 * @returns {Promise} - with aggregate data
 */
exportModel.calcAgr = (pairs, period) => {
  let pairsAgr = [];
  pairs.forEach((pair, idx) => {
    pairsAgr[idx] = {
      ...pair[0],
      time: exportModel.getTimeAgr(period),
    };

    pair.forEach((one) => {
      pairsAgr[idx].high < one.high && (pairsAgr[idx].high = one.high);
      pairsAgr[idx].low > one.low && (pairsAgr[idx].low = one.low);

      pairsAgr[idx].close = one.close;
    });
  });
  return Promise.resolve(pairsAgr);
};

// because all aggregation happen 1 minute after the period
// need to subtract one period
exportModel.getTimeAgr = (period) => {
  var periodMs = cfg.periods[period];
  var nowDate = new Date(); //or use any other date
  return new Date(Math.round(nowDate.getTime() / periodMs) * periodMs);
};

// save to destination Collection
exportModel.saveAgrData = (agrData, model) => model.insertMany(agrData);

exportModel.getModel = (modelType, period) => {
  const dbclient = model.getClient();
  if (modelType === "source") {
    return dbclient.model(
      cfg.collections.source[period],
      ratesSchema,
      cfg.collections.source[period]
    );
  } else if (modelType === "destination") {
    return dbclient.model(
      cfg.collections.destination[period],
      ratesSchema,
      cfg.collections.destination[period]
    );
  } else {
    return dbclient.model("base", baseSchema);
  }
};

// save BASE RATES data - feeder
exportModel.saveData = (ratesData) => {
  const dbModel = exportModel.getModel();

  const baseRates = ratesData.map((rate) => {
    const value = (parseFloat(rate.bid) + parseFloat(rate.offer)) / 2;
    return {
      pid: cfg.pairs[rate.pair],
      value: parseFloat(value).toFixed(5),
      ...rate,
    };
  });

  return dbModel.insertMany(baseRates);
};

/** OLD ................... */
const getModel = () => {
  const dbClient = model.getClient();
  return dbClient.model("rate", ratesSchema);
};

exportModel.find = (query) => {
  const rateModel = getModel();
  return rateModel.find(query);
};

exportModel.save = function (ratesData) {
  let pid,
    rate,
    rateDoc = {},
    saveData = [];
  global.debug && global.debug(ratesData.length, "Rate save data length");

  // array of names ["USD/EUR", ....]
  const pairsName = Object.keys(cfg.pairs);

  for (var i in ratesData) {
    pid = i.substr(2);
    rate = ratesData[i];
    rateDoc = {
      pid: pid,
      pair: pairsName[pid],
      open: rate.open,
      high: rate.max,
      low: rate.min,
      close: rate.close,
      time: rate.time,
    };
    saveData.push(rateDoc);
  }

  return new Promise((resolve, reject) => {
    const rateModel = getModel();
    rateModel.insertMany(saveData).then(resolve).catch(reject);
  });
};

exportModel.deleteAll = () => {
  return new Promise((res, rej) => {
    getModel().deleteMany({}, () => {
      res();
    });
  });
};

module.exports = exportModel;
