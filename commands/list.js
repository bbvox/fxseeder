#!/usr/bin/env node

const mongoose = require('mongoose')
mongoose.Promise = Promise

const Schema = mongoose.Schema

const liveCfg = require('../config/mongo')

const mongo = require("../config/mongo");

mongoose.connect(liveCfg.host, { useMongoClient: true }, err => {
    console.log("... Mongo Connect : ", err);
})

const rawSchema = new Schema({
    id: Number,
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
    rateModel.find({}, (err, data) => {
        if (err) {
            console.log(">>>", err);
        }
        console.log("....", data);

    })
}

findRate();