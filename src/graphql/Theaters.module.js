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
            findTheaterById(theaterId: Int): Theater
            findTheaterByCity(city: String): [Theater]
            getAllTheaters: [Theater]
        }

        extend type Mutation {
            insertOneTheater(location: LocationInput): Theater
        }
    `,
    resolvers: {
        Query: {
            findTheaterById: async (_, args, context) => {
                let { theaterId } = args;
                let theater = await context.Theaters.findOne({ theaterId });

                return theater;
            },
            findTheaterByCity: async (_, args, context) => {
                let { city } = args;
                const theaters = await context.Theaters.find({
                    'location.address.city': city,
                }).toArray();

                return theaters;
            },
            getAllTheaters: async (_, args, context) => {
                let theaters = await context.Theaters.find().toArray();

                return theaters;
            },
        },
        Mutation: {
            insertOneTheater: async (_, args, context) => {
                const { location } = args;

                const now = new Date();
                const _id = uuidv4();

                let doc = {};
                doc.createdAt = now;
                doc.updatedAt = now;

                let loc = location;
                doc.location = loc;

                const response = await context.Theaters.insertOne({
                    _id,
                    ...doc,
                });

                if (!response.ops[0]) {
                    return null;
                }

                return response.ops[0];
            },
        },
    },
};

export default TheaterModule;
