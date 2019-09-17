'use strict';

const req = require("request")
const cfg = require("../config")
const helper = require("./helper")
const model = require("./model")
const rate = require("./rate")

const getRequest = () => ({
  ...cfg.request,
  url: cfg.request.urlRoot + cfg.request.urlPath,
  qs: {
    l: "n",
    t: 1,
    query: Math.random()
  }
});

/** 
 * 1. getData 
 * 2. store into mongoDB  - rrates Collection 
 */
const getData = () => {
  return new Promise((resolve, reject) => {
    req(getRequest(), (err, res, bodyHtml) => {
      if (err) {
        return reject({ message: "Wrong or missing target website ." });
      } else if (!bodyHtml || bodyHtml.length < 100) {
        return reject({ message: "Source website is missing ." });
      }
      global.debug && global.debug(bodyHtml, " source response ");
      let pairsData = helper.str.splitter(bodyHtml);
      pairsData = helper.str.parser(pairsData);

      // save in rrates collection - RAW RATES on every minutes...
      model.save(pairsData)
        .then(model.checkMinutes)
        .then(model.agregate)
        .then(rate.ssave)
        .then(agrData => resolve())
        .catch(err => reject(err))
    });
  });
}

/**
 * 1. connect to mongoDB
 * 2. make request
 * 3. store to mongoDB
 */
module.exports = function () {
  return model.connect()
    .then(getData)
    .then(data => Promise.resolve(data))
    .catch(err => Promise.reject(err));
};