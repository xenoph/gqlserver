import { v4 as uuidv4 } from 'uuid';

const TheaterModule = {
    typeDefs: `
        type Theater inherits Document {
			theaterId: Int
			location: Location
        } 

		type Location {
			address: Address
			geo: Geo
		}

        type Geo {
            type: String
            coordinates: [Float]
        }

        type Address {
			street1: String
			city: String
			state: String
			zipcode: String
        }

		input LocationInput {
			address: AddressInput
			geo: GeoInput
		}

		input AddressInput {
			street1: String
			city: String
			state: String
			zipcode: String
		}

		input GeoInput {
			type: String
			coordinates: [Float]
		}

        extend type Query {
            findTheater(theaterId: Int): Theater
            findTheaters(): [Theater]
        }

        extend type Mutation {
            insertOneTheater(location: LocationInput): Theater
        }
    `,
    resolvers: {
        Query: {
            findTheater: async (_, args, context) => {
                let { theaterId } = args;
                let theater = await context.Theaters.findOne({ theaterId });

                return theater;
            },
            findTheaters: async (_, args, context) => {
                let theaters = await context.Theaters.find().toArray();

                return theaters;
            },
        },
        Mutation: {
            insertOneTheater: async (_, args) => {
                const now = new Date();

                let doc = {};
                doc._id = uuidv4();
                doc.createdAt = now;
                doc.updatedAt = now;

                let loc = args.location;
                doc.location = loc;

                console.log(doc);
            },
        },
    },
};

export default TheaterModule;
