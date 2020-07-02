const req = require("request");
const cfg = require("../config");
const helper = require("./helper");

const getRequest = () => ({
  ...cfg.request,
  url: cfg.request.urlRoot + cfg.request.urlPath,
  qs: {
    l: "n",
    t: 1,
    query: Math.random(),
  },
});

/**
 * 1. get data from source
 * 2. extract it
 * 3. Format data
 */
const getData = () => {
  return new Promise((resolve, reject) => {
    req(getRequest(), (err, res, bodyHtml) => {
      global.debug && global.debug(bodyHtml, " source response ");
      if (err) {
        return reject({ message: "Wrong or missing source website ." });
      } else if (!bodyHtml || bodyHtml.length < 100) {
        return reject({ message: "Source website is missing/broken ." });
      }
      const splittedData = helper.str.splitter(bodyHtml);
      const pairsData = helper.str.parser(splittedData);

      resolve(helper.str.hashtag(pairsData));
    });
  });
};

module.exports = {
  getData,
};
