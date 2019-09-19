'use strict';
/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
mongoose.Promise = Promise

const cfg = require('../config')
// mongo in Memory
const liveCfg = require('../config/mongo')
const mongoHost = liveCfg.host || cfg.mongo.host;

/*
 1. client
 2. model
 3. schema
*/
const db = {
  client: false,
  model: false,
  schema: new mongoose.Schema({
    id: Number,
    value: Number,
    ohlc: String,
    time: Date,
    created: { type: Date, default: Date.now }
  })
};

const exportModel = {};

exportModel.connect = (mongoDbTest = "") => {
  return new Promise((res, rej) => {
    if (db.client) {
      return res();
    }

    const dbHost = mongoDbTest || mongoHost;
    db.client = new mongoose.Mongoose();
    db.client.connect(dbHost, cfg.mongo.options, dbErr => {
      if (dbErr) {
        global.debug && global.debug(dbErr, "mongoDb connection");
        return rej(dbErr);
      }

      global.debug && global.debug(dbHost, "mongoDB host");
      db.model = db.client.model('rrate', db.schema);
      res();
    });
  });
}

exportModel.close = () => {
  db.client.disconnect();
}

exportModel.getModel = () => (db.model);

exportModel.save = (ratesData) => {
  let rawDoc = {}, diff, pairName, saveData = [];

  for (var i in ratesData) {
    let rate = ratesData[i];
    pairName = rate.pair.toLowerCase();
    diff = parseFloat(rate.high) - parseFloat(rate.low)
    diff = Math.abs(diff) / 2
    diff = parseFloat(diff.toFixed(6))
    rawDoc = {
      id: cfg.pairs.indexOf(pairName),
      value: parseFloat(rate.low) + diff,
      ohlc: `${rate.open};${rate.high};${rate.low};${rate.close}`,
      time: rate.time
    }

    if (('' + rawDoc.value).length > 6) {
      rawDoc.value = parseFloat(rawDoc.value.toFixed(6))
    }

    saveData.push(rawDoc);
  }

  return new Promise((resolve, reject) => {
    global.debug && global.debug(saveData, "mongoDB saveData");

    db.model.insertMany(saveData)
      .then(savedData => resolve(savedData),
        err => reject(err))
  })
}

//continue chain if minutes is 0, 15, 30, 45
// if minutes % 15 === 0 resolve
// else reject
exportModel.checkMinutes = () => {
  let minutes;
  minutes = (new Date()).getMinutes()
  return new Promise((resolve, reject) => {
    if (!(minutes % cfg.minPerPeriod)) {
      resolve()
    } else {
      reject({ error: "!checkMinutes." })
    }
  })
}

// 900 000 - 60 * 1000 * 15 - 15 min in milliseconds
//open, min, max, close
exportModel.agregate = () => {
  return new Promise((resolve, reject) => {
    let dtime = {}, minFrom;
    dtime.to = new Date()
    minFrom = 60 * 1000 * cfg.minPerPeriod;
    dtime.from = new Date(dtime.to.getTime() - minFrom)

    // !!! get rawRates for last 15 minutes
    db.model.find({ created: { $gte: dtime.from, $lt: dtime.to } })
      // .limit(150).then(resData => {
      .then(resData => {
        let pairOhlc = {}
        // !!! sort By pairID
        let pairsArray = exportModel.orderById(resData)
        for (var pairId in pairsArray) {
          // !!! get OHLC for pairId
          pairOhlc[pairId] = exportModel.ohlc(pairsArray[pairId])
        }

        resolve(pairOhlc)
      })
  })
}

exportModel.ohlc = pairArray => {
  let perPeriod = {};
  perPeriod.min = perPeriod.max = pairArray[0].value;
  perPeriod.open = pairArray[0].value

  pairArray.map(item => {
    let value = item.value

    if (perPeriod.min > value)
      perPeriod.min = value
    if (perPeriod.max < value)
      perPeriod.max = value

    perPeriod.close = value
  })

  return perPeriod;
}

// sorted{id1}
exportModel.orderById = rawData => {
  let sorted = {}, key;

  for (var index in rawData) {
    key = "id" + rawData[index].id;
    sorted[key] || (sorted[key] = [])
    sorted[key].push(rawData[index])
  }

  return sorted;
}

module.exports = exportModel;