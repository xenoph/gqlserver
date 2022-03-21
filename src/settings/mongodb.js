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
        Theaters: mongodb.collection('theaters'),
        Movies: mongodb.collection('movies'),
        Comments: mongodb.collection('comments'),
        Users: mongodb.collection('users'),
    };

    return db;
}

export default setupMongodbClient;
