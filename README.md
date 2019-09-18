# fxl.com seeder

[![Build Status](https://travis-ci.org/bbvox/fxseeder.svg?branch=master)](https://travis-ci.org/bbvox/fxseeder)
[![Coverage Status](https://coveralls.io/repos/github/bbvox/fxseeder/badge.svg?branch=master)](https://coveralls.io/github/bbvox/fxseeder?branch=master)

## Description
Micro service to get data from config/index.json ( url ) and store it to the DB

## START
`npm start`
`npm run debug`
###OR
`npm test`
### Start locally - without mongoDB installed (with in memoryMongoDB)
Start in memory mongoDb and store the config endpoint to config/mongo.json
```
$ npm run start:mongo
$ npm start
```
### Other commands
list all rates based blank SCHEMA
`$ ./commands/list.js`

##  Setup crontab
`$ crontab -e`
`*/1 * * * * /usr/local/bin/node /var/www/html/index.js >> /var/www/html/projFolder/logs/cron.log`

## Short description  

1. Go to url config.url and get content

2. Split and format content per pairs

3. Save raw rates at collection RRATES

```
const rawSchema = new Schema({
	id: Number,
	value: Number,
	time: Date,
	created: {type: Date, default: Date.now}
})
```
4. if time % config.minPerPeriod === 0 true continue

model.checkMinutes

5. model.agregate select RawRates for last config.minPerPeriod

dtime.to = now

dtime.from = now - config.minPerPeriod (-15min)

find({created: {$gte: dtime.from, $lt: dtime.to}})

6. save OHLC info into RATES

7. exit with process(0) or process(1)
  

toDo :

======================================

1. Extend cralwer action use register to truefx.com to get more pairs

2. Generate and other collections 30min 1hour 4hour 1day 1week

3. change OHLC(Open/High/Low/Close) into ARRAY from string !!!
  
   
  

### HINTs
1. for testing start local MongoInMemory server and use it.
2. for dev also possible to use inMemory MongoDB


Get output from one command and pass it to another. 
ONLY COMMAND LINE...

```
C1=`./commands/index.js` && ./commands/get.js $C1
```