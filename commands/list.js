#!/usr/bin/env node

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const liveCfg = require('../config/mongo')
const cfg = require("../config");

mongoose.connect(liveCfg.host || cfg.mongo.host, cfg.mongo.options, err => {
    err && console.log("... Mongo Connect ERROR : ", err);
});

const rawSchema = new Schema({
    sid: Number,
    value: Number,
    ohlc: String,
    time: Date,
    created: { type: Date, default: Date.now }
})

const rateSchema = new Schema({
    sid: { type: Number, max: 200 },
    symbol: String,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    created: { type: Date, default: Date.now }
})

let rawModel = mongoose.model('rrate', rawSchema)

let rateModel = mongoose.model('rate', rateSchema)

const findRate = () => {
    rateModel.find({}, null, { limit: 1 }, (err, data) => {
        err && console.log(".: query ERROR :", err);

        console.log(".: query DATA : ", data);
    })
}

findRate();