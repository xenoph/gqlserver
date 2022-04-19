import { v4 as uuidv4 } from 'uuid';

const MoviesModule = {
    typeDefs: `
        type Movie inherits Document {
            _id: ID
            plot: String
            genres: [String]
            runtime: Int
            cast: [String]
            num_mflix_comments: Int
            title: String
            fullplot: String
            countries: [String]
            released: DateTime
            rated: String
            awards: Award
            lastupdated: String
            year: Int
            imdb: Imdb
            type: String
            tomatoes: Tomatoes
        } 

        type Award {
            wins: Int
            Nominations: Int
            text: String
        }

        type Imdb {
            rating: Float
            votes: Int
            id: Int
        }

        type Tomatoes {
            viewer: Viewer
            critic: Critic
            lastUpdated: DateTime
        }

        type Viewer {
            rating: Float
            numReviews: Int
            meter: Int
        }

        type Critic {
            rating: Float
            numReviews: Int
            meter: Int
        }

        extend type Query {
            findAllMovies: [Movie]
        }

        extend type Mutation {
            insertOneMovie(): Movie
        }
    `,
    resolvers: {
        Query: {
            findMovies: async (_, args, context) => {
                let movies = await context.Movies.find().toArray();

                return movies;
            },
        },
        Mutation: {
            insertOneMovie: async (_, args) => {
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

export default MoviesModule;
