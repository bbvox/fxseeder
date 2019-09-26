'use strict';

const mongoose = require('mongoose');

const cfg = require('./config');

const exportModel = {};

const ratesSchema = new mongoose.Schema(cfg.mongodb.rateSchema);

// 1. find
// 2. agregate
// 3. save
// ROOT METHOD
// return <Promise>
// be careful with period ...
exportModel.agregate = (period) => {
    const srcModel = exportModel.getModel("source", period);
    const destModel = exportModel.getModel("destination", period);

    return exportModel.getData(srcModel)
        .then(exportModel.validateData)
        .then(exportModel.calcAgr)
        .then((aggregateData) => exportModel.save(aggregateData, destModel))
        .catch(err => {
            // resolve to go on with promise.all from upper layer
            if (err.code === 1) {
                console.log("There is EMPTY response from FIND query...");
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
    //collect promises
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
exportModel.save = (agrData, model) =>
    (model.insertMany(agrData))

exportModel.getModel = (modelType, period) => {
    if (modelType === "source") {
        return mongoose.model(cfg.mongodb.source[period], ratesSchema, cfg.mongodb.source[period]);
    } else if (modelType === "destination") {
        return mongoose.model(cfg.mongodb.destination[period], ratesSchema, cfg.mongodb.destination[period]);
    }
}

module.exports = exportModel;