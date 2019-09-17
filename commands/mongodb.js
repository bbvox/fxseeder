#!/usr/bin/env node

// start mongo inMemory server and store url in config/mongodb.json
const fs = require('fs');
const mongoDb = require('mongodb-memory-server').MongoMemoryServer;
const mongoData = {
    file: "./config/mongo.json",
    conf: {
    }
};

async function startMongo() {
    const mongod = new mongoDb();

    mongoData.conf.host = await mongod.getConnectionString();
    fs.writeFile(mongoData.file, JSON.stringify(mongoData.conf), (err, data) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`.: mongoDB start successful: ${mongoData.conf.host}`);
    });
}

startMongo();