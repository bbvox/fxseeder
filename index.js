#!/usr/bin/env node
'use strict';

const app = require("./app");

const debugFlag = process.argv.slice(2);

if (debugFlag[0] && debugFlag[0] === "--debug") {
  console.log(".: debug MODE :\x1b[31m ON \x1b[0m:");
  global.debug = (debugData, area = "") => {
    console.log(`.: \x1b[32m DEBUG \x1b[0m : ${new Date().toLocaleString()} - \x1b[32m ${area} : \x1b[0m`);
    console.log(debugData);
  };
} else {
  global.debug = () => { };
}

/** 
 * exit - 0 success 
 * exit - 1 fail operation
 */
app.feeder()
  .then(() => process.exit(0))
  .catch(appErr => {
    global.debug && global.debug(appErr, "APP LEVEL - GENERAL");
    process.exit(1);
  });