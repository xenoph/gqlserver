import { findOne, find } from '../resolvers.js';
import { uuid } from 'uuid';

const TheaterModule = {
    typeDefs: `
        type Theater inherits Document {
				 theaterid: int
				 location: Location
        } 

		type Location {
			address: Address
			geo: Geo
		}

		type Address {
			street1: String
			city: String
			state: String
			zipcode: String
		}

		type Geo {
			type: String
			coordinates: [Float]
		}

        extend type Query {
            findOneMovie(_id: ID!): Movie
            findMovies(): Find<Movie>
        }

        extend type Mutation {
            insertOneTheater(title: String): Movie
        }
    `,
    resolvers: {
        Query: {
            findOneMovie: findOne('Movies'),
            findMovies: find('Movies'),
        },
        Mutation: {
            insertOneMovie: async (_, args) => {
                const now = new Date();

                let doc = {};
                doc._id = uuid();
                doc.createdAt = now;
                doc.updatedAt = now;
            },
        },
    },
};

export default TheaterModule;