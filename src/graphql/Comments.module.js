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
            findCommentFromUser(name: String): Comment
            getAllComments: [Comment]
        }

        extend type Mutation {
            insertOneComment(name: String, email: String, text: String): Comment
        }
    `,
    resolvers: {
        Query: {
            findCommentFromUser: async (_, args, context) => {
                let { name } = args;
                let comment = await context.Comments.findOne({ name });

                return comment;
            },
            getAllComments: async (_, __, context) => {
                let comments = await context.Comments.find().toArray();
                console.log('Fetching all comments');
                console.log(comments);

                return comments;
            },
        },
        Mutation: {
            insertOneComment: async (_, args) => {
                const { name, email, text } = args;
                const now = new Date();

                let doc = {};
                doc._id = uuidv4();
                doc.createdAt = now;
                doc.updatedAt = now;

                doc.name = name;
                doc.email = email;
                doc.text = text;
            },
        },
    },
};

export default CommentsModule;
