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
  schema: new mongoose.Schema(cfg.mongo.rrateSchema)
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
    diff = parseFloat(rate.high) - parseFloat(rate.low)
    diff = Math.abs(diff) / 2
    diff = parseFloat(diff.toFixed(6))
    rawDoc = {
      sid: cfg.pairs[rate.symbol],
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
      .then(savedData => resolve(ratesData),
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