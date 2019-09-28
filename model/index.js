'use strict';

const mongoose = require('mongoose');

const cfg = require('../config')
const liveCfg = require('../config/mongo') // mongo in Memory
const hlp = require('../app/helper')
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
      hlp.isDebug() && db.client.set('debug', true);

      db.model = db.client.model('rrate', db.schema);
      res();
    });
  });
}

exportModel.getClient = () => (db.client);

exportModel.getModel = () => (db.model);

exportModel.save = (ratesData) => {
  let rawDoc = {}, diff, saveData = [];

  for (var i in ratesData) {
    let rate = ratesData[i];
    // pairName = rate.pair.toLowerCase();
    diff = parseFloat(rate.high) - parseFloat(rate.low)
    diff = Math.abs(diff) / 2
    diff = parseFloat(diff.toFixed(6))
    // id: cfg.pairs.indexOf(pairName),
    rawDoc = {
      id: cfg.pairs[rate.pair],
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
      reject({ error: "! checkMinutes." })
    }
  })
}

// 15min = 900 000mS - 60 * 1000 * 15
//open, min, max, close
exportModel.agregate = () => {
  return new Promise((resolve, reject) => {
    let dtime = {}, minFrom;
    dtime.to = new Date()
    minFrom = 60 * 1000 * cfg.minPerPeriod;
    dtime.from = new Date(dtime.to.getTime() - minFrom)

    // !!! get rawRates for last 15 minutes
    db.model.find({ created: { $gte: dtime.from, $lt: dtime.to } })
      .then(resData => {
        let pairOhlc = {}
        let pairsArray = exportModel.orderById(resData)
        for (var pairId in pairsArray) {
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

exportModel.orderById = rawData => {
  let sorted = {}, key;

  for (var index in rawData) {
    key = "id" + rawData[index].id;
    sorted[key] || (sorted[key] = [])
    sorted[key].push(rawData[index])
  }

  return sorted;
}

exportModel.close = () => {
  db.client.disconnect();
}

module.exports = exportModel;