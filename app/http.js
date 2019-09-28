const req = require("request")
const cfg = require("../config")
const helper = require("./helper")

const getRequest = () => ({
  ...cfg.request,
  url: cfg.request.urlRoot + cfg.request.urlPath,
  qs: {
    l: "n",
    t: 1,
    query: Math.random()
  }
});

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

      // save in rrates collection - RAW RATES on every minutes...
      // model.save(helper.str.parser(pairsData))
      // .then(model.checkMinutes)
      // .then(model.agregate)
      // .then(rate.save)
      // .then(agrData => resolve())
      // .catch(err => reject(err))
    });
  });
}

module.exports = {
  getData
};