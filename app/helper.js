'use strict';
/**
 * Module dependencies.
 Native module
 */
var StringLayer = {};

StringLayer.splitter = function (fxData) {
  var total = 10;
  var circles = [7, 4, 3, 4, 3, 7, 7, 13];

  var result = [];
  var splitIt, leftStr = fxData, arr;

  //insert into array
  // EUR/USD, USD/JPY, GBP/USD
  // 123., 1.50, 0.70, 
  splitIt = function (string, length) {
    var arr = [], start = 0;
    for (var i = 0; i < total; i++) {
      arr.push(string.substring(start, start + length));
      start += length;
    }
    return arr;
  };

  for (var i in circles) {
    arr = splitIt(leftStr, circles[i]);

    leftStr = leftStr.substr(circles[i] * total);
    result.push(arr);
  }

  return result;
};

//strange mapper
StringLayer.parser = function (splitArray) {
  var out = [], map = ["pair", "low", "low", "high", "high", "open", "close", "time"];
  for (var i = 0; i <= splitArray.length - 1; i++) {
    for (var i2 = 0; i2 <= splitArray[i].length - 1; i2++) {
      out[i2] || (out[i2] = {});
      // append pair data
      out[i2][map[i]] = (out[i2][map[i]]) ? out[i2][map[i]] + splitArray[i][i2] : splitArray[i][i2];
    }
  }

  return out;
};

let debugFlag = false;
//argument Check 
// if debug flag is set register process.debug
const argvCheckDebug = () => {
  const cliParams = process.argv.slice(2);

  global.debug = () => { };

  if (cliParams[0] && cliParams[0] === "--debug") {
    global.debug = (debugData, area = "") => {
      console.log(`.: \x1b[32m DEBUG \x1b[0m : ${new Date().toLocaleString()} - \x1b[32m ${area} : \x1b[0m`);
      console.log(debugData);
    };
    debugFlag = true
  }
}

const isDebug = () => (debugFlag)

const cfg = require("../config");
//aggregate flow
// return Promise<>
const getPeriods = () => {
  const { periods, params: { allowedDelay } } = cfg;
  const now = new Date().getTime();
  // const now = new Date('August 20, 2018 03:32:00').getTime(); // use for testing

  let agrPeriods = [];

  Object.keys(periods).forEach(pkey => {
    const diff = now % periods[pkey];
    if (diff < allowedDelay) {
      agrPeriods.push(pkey);
    }
  });

  return (agrPeriods.length)
    ? Promise.resolve(agrPeriods)
    : Promise.reject({ err: "!helper.getPeriods - Not Found." });
}

module.exports = {
  str: StringLayer,
  argvCheckDebug,
  getPeriods,
  isDebug
};