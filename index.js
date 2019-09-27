#!/usr/bin/env node
'use strict';

const app = require("./app");
const hlp = require("./app/helper");

hlp.argvCheck();

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