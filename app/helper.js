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

module.exports = {
  str: StringLayer
};