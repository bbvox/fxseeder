const req = require("request");
const cfg = require("../config");
const helper = require("./helper");

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
 * 1. get data from source
 * 2. extract it
 */
const getData = () => {
  return new Promise((resolve, reject) => {
    req(getRequest(), (err, res, bodyHtml) => {
      if (err) {
        return reject({ message: "Wrong or missing source website ." });
      } else if (!bodyHtml || bodyHtml.length < 100) {
        return reject({ message: "Source website is missing/broken ." });
      }

      global.debug && global.debug(bodyHtml, " source response ");
      let pairsData = helper.str.splitter(bodyHtml);

      resolve(helper.str.parser(pairsData));
    });
  });
};

module.exports = {
  getData
};
