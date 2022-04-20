import { v4 as uuidv4 } from 'uuid';

const MoviesModule = {
    typeDefs: /* GraphQL */ `
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
            findMovieByTitle(title: String): Movie
            findMovieById(id: ID!): Movie
        }

        extend type Mutation {
            insertOneMovie(
                title: String
                fullplot: String
                rated: String
                released: DateTime
                genres: [String]
                cast: [String]
            ): Boolean
        }
    `,
    resolvers: {
        Query: {
            findAllMovies: async (_, args, context) => {
                let movies = await context.Movies.find().toArray();

                return movies;
            },
            findMovieByTitle: async (_, args, context) => {
                const { title } = args;
                let movie = await context.Movies.findOne({ title });

                return movie;
            },
            findMovieById: async (_, args, context) => {
                const { id } = args;
                let movie = await context.Movies.findOne({ _id: id });

                return movie;
            },
        },
        Mutation: {
            insertOneMovie: async (_, args, context) => {
                const now = new Date();

                let doc = { ...args };
                const _id = uuidv4();
                doc.createdAt = now;
                doc.updatedAt = now;

                const response = await context.Movies.insertOne({
                    _id,
                    ...doc,
                });

                if (!response.acknowledged) {
                    return false;
                }

                return true;
            },
        },
    },
};

export default MoviesModule;
