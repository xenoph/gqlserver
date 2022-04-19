import { v4 as uuidv4 } from 'uuid';

const UsersModule = {
    typeDefs: `
		type User inherits Document {
			_id: ID
			name: String
			email: String
			password: String
		}

        extend type Query {
            findUserByName(name: String): User
			findUserByEmail(email: String): User
            getAllUsers: [User]
        }

        extend type Mutation {
			insertOneUser(name: String, email: String, password: String): User
        }
    `,
    resolvers: {
        Query: {
            findUserByName: async (_, args, context) => {
                let { name } = args;
                let user = await context.Users.findOne({ name });

                return user;
            },
            findUserByEmail: async (_, args, context) => {
                let { email } = args;
                let user = await context.Users.findOne({ email });

                return user;
            },
            getAllUsers: async (_, __, context) => {
                let users = await context.Users.find().toArray();

                return users;
            },
        },
        Mutation: {
            insertOneUser: async (_, args, context) => {
                const now = new Date();

                let doc = { ...args };
                const _id = uuidv4();
                doc.createdAt = now;
                doc.updatedAt = now;

                const response = await context.Users.insertOne({ _id, ...doc });

                if (!response.ops[0]) {
                    return null;
                }

                return response.ops[0];
            },
        },
    },
};

export default UsersModule;
