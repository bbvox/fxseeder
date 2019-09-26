#!/usr/bin/env node
"use strict";

const cfg = require('./agr/config');
// otherwise will include agr.js which is wrong
const aggregate = require("./agr/");

// 0 - period flag (15m || 30m || 1h || 4h || 1d || 1w)
// 1 - "--debug" flag
const optionsFlag = process.argv.slice(2);

if (!optionsFlag[0] || !cfg.mongodb.destination[optionsFlag[0]]) {
    console.log(".: ERROR : Missing period argument");
    process.exit(1);
}
if (optionsFlag[1] && optionsFlag[1] === "--debug") {
    console.log(".: debug MODE :\x1b[31m ON \x1b[0m:");
    global.debug = (debugData, area = "") => {
        console.log(`.: \x1b[32m DEBUG \x1b[0m : ${new Date().toLocaleString()} - \x1b[32m ${area} : \x1b[0m`);
        console.log(debugData);
    };
} else {
    global.debug = () => { };
}


// app(PERIOD) - 15m
aggregate()
    .then(data => {
        console.log("NORMAL EXIT >>>>")
        process.exit(0);
    })
    .catch(errData => {
        console.log(".: ERROR :", errData);
        process.exit(1);
    });
/*

console.log("+ success");

var mongoose = require('mongoose');
mongoose.connect(cfg.mongodb.connect);

mongoose.set('debug', cfg.dev);

var db = require('./modules/model');


db.agregate(param, function (err, data) {
	if (err) {
		process.exit(1);
	}
	process.exit(0);
});
*/