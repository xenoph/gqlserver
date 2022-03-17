import { insertOne, findOne, find } from '../resolvers.js';

const MovieModule = {
    typeDefs: `
        type Movie inherits Document {
            title: String!
        } 

        extend type Query {
            findOneMovie(_id: ID!): Movie
            findMovies(): Find<Movie>
        }

        extend type Mutation {
            insertOneMovie(title: String): Movie
        }
    `,
    resolvers: {
        Query: {
            findOneMovie: findOne('Movies'),
            findMovies: find('Movies'),
        },
        Mutation: {
            insertOneMovie: insertOne('Movies'),
        },
    },
};

export default MovieModule;
