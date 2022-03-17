import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import setupMongodbClient from './settings/mongodb.js';
//var setupMongodbClient = require('./settings/mongodb');

import schema from './graphql.schema.js';

const app = express();
app.use(cors());

const setup = async () => {
    const mongodb = await setupMongodbClient();
    const server = new ApolloServer({
        schema,
        context: async () => {
            return {
                ...mongodb,
            };
        },
    });

    await server.start();

    server.applyMiddleware({ app, path: '/graphql' });

    await app.listen({ port: 4000 }, () => {
        console.log('Apollo Server on http://localhost:4000/graphql');
    });
};

setup().then(() => {
    console.log('running lol');
});
