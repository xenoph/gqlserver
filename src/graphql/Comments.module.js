import { v4 as uuidv4 } from 'uuid';

const CommentsModule = {
    typeDefs: `
		type Comment inherits Document {
			_id: ID
			name: String
			email: String
			movie_id: ID
			text: String
			date: DateTime
		}

        extend type Query {
            findCommentByUserName(name: String): Comment
            findCommentByUserEmail(email: String): Comment
            getAllComments: [Comment]
        }

        extend type Mutation {
            insertOneComment(name: String, email: String, text: String): Comment
        }
    `,
    resolvers: {
        Query: {
            findCommentByUserEmail: async (_, args, context) => {
                let { email } = args;
                const comment = await context.Comments.findOne({ email });

                return comment;
            },
            findCommentByUserName: async (_, args, context) => {
                let { name } = args;
                let comment = await context.Comments.findOne({ name });

                return comment;
            },
            getAllComments: async (_, __, context) => {
                let comments = await context.Comments.find().toArray();

                return comments;
            },
        },
        Mutation: {
            insertOneComment: async (_, args, context) => {
                const now = new Date();
                const _id = uuidv4();

                let doc = { ...args };
                doc.createdAt = now;
                doc.updatedAt = now;

                const response = await context.Comments.insertOne({
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

export default CommentsModule;
