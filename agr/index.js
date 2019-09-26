'use strict';

const mongoose = require('mongoose');

const model = require("./model")
const cfg = require('./config');

const mongo = require("../config/mongo");

mongoose.connect((mongo.host || cfg.mongodb.connect), {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('debug', true);


// check every periods 
// per default at least 15m should be applicable
// divide current time with period in milliseconds ...
// 16h.30m % 15m = 0 = this is my time 
const checkPeriods = () => {
    const { periods, diffMs } = cfg;
    // local time GMT + 3
    // const now = new Date('August 20, 2018 03:02:00').getTime(); - use for testing
    const now = new Date().getTime();
    let promises = [];

    Object.keys(periods).forEach(pkey => {
        const diff = now % periods[pkey];
        if (diff < diffMs) {
            promises.push(model.agregate(pkey));
        }
    });
    return Promise.all(promises);
}

/**
 * 1. get for period
 * 2. Agregate data
 * 3. store to destination
 */
module.exports = () => {
    return checkPeriods();
    // return Promise.resolve();
};