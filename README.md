# fxl.com seeder & calculate
[![Build Status](https://travis-ci.org/bbvox/fxseeder.svg?branch=master)](https://travis-ci.org/bbvox/fxseeder)
[![Coverage Status](https://coveralls.io/repos/github/bbvox/fxseeder/badge.svg?branch=master)](https://coveralls.io/github/bbvox/fxseeder?branch=master)
  
## About the project
 1. Micro service to get data from config/index.js ( url ) and store it to the DB
 2. Other part of the project utilize db data and create aggregate collection from it.

## Instalation
```
$ git clone
$ cd project_folder
$ npm install OR npm ci (same versions)
```  

## Start
```
npm start - get data
npm run start:debug - get data verbose mode
-------------------
npm run start:aggregate - generate aggregate
-------------------
npm run start:mongodb - start local mongoDB
```
### Testing
With mocha, chai, sinon, nock, mongodb-memory-server & nyc - reporter
`npm test` 

### Start locally - without mongoDB installed (with in memoryMongoDB)

Start locally without install mongoDb / use inMemoryMongoDB
`npm run start:mongodb`

## Setup

run on every minutes
```
*/1 * * * * /../../index.js >> /../../logs/index.log 2>&1
*/1 * * * * /usr/local/bin/node /../../index.js >> /../../logs/index.log 2>&1
```

run on every 15 minutes
`*/15 * * * * /../../agr.js >> /../../logs/agr.log 2>&1`

### Other commands
`$ ./commands/list.js` - list saved data

## Setup crontab

`$ crontab -e`

`*/1 * * * * /usr/local/bin/node /var/www/html/index.js >> /var/www/html/projFolder/logs/cron.log`

## Flow 1 steps
1. Go to url config.url and get content
2. Split and format content per pairs/symbols
3. Save raw rates at collection RRATES

```
const rawSchema = new Schema({
  sid: Number,
  value: Number,
  ohlc: String,
  time: Date,
  created: {type: Date, default: Date.now}
})
```
5. Save into RATES 
6. exit with success (0) or fail(1)

## toDo :

 1. Tune aggregate find query to be more explicit/strict - created between date1 and date2 
   db.collection({created: {$gt: startDate, $lt: endDate}})

 1. Extend cralwer action use register to *** to get more pairs
 2. change OHLC(Open/High/Low/Close) into ARRAY from string !!!
 3. Think about collection indexes ...


### HINTs

1. for testing start local MongoInMemory server and use it.

2. CLI redirection Get output from one command and pass it to another.

3. Stop trace changes for file
``
git update-index --assume-unchanged FILE_NAME 
``

4. require('folder') - require order is : index.js then index.json if both of them are present

ONLY COMMAND LINE...
```
C1=`./commands/index.js` && ./commands/get.js $C1
```
*** Mongoose queries which did not return promise

```
Model.deleteMany()
Model.deleteOne()
Model.find()
Model.findById()
Model.findByIdAndDelete()
Model.findByIdAndRemove()
Model.findByIdAndUpdate()
Model.findOne()
Model.findOneAndDelete()
Model.findOneAndRemove()
Model.findOneAndUpdate()
Model.replaceOne()
Model.updateMany()
Model.updateOne()
```

period = (new Date()).getTime();
period = parseInt(period / 1800000); //hours in year
