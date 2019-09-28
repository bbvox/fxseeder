#!/usr/bin/env node
"use strict";

const app = require("./app");
const hlp = require("./app/helper");

hlp.argvCheckDebug();

/** 
 * exit - 0 success 
 * exit - 1 fail operation
 */
app.aggregate()
  .then(() => process.exit(0))
  .catch(errData => {
    global.debug && global.debug(errData, "APP LEVEL - GENERAL");
    process.exit(1);
  });