import { MongoClient } from 'mongodb';
//const MongoClient = require('mongodb').MongoClient;

async function setupMongodbClient() {
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const mongodb = await client.db();

    const db = {
        mongodb,
        Movies: mongodb.collection('Movies'),
    };

    return db;
}

export default setupMongodbClient;
