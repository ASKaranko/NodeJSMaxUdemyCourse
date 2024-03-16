const { buildSchema } = require('graphql');

// ! - required
module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    input UserDataInput {
        email: String!
        name: String!
        password: String!
    }

    type Query {
        hello: String
    }

    type Mutation {
        createUser(userInput: UserDataInput): User!
    }

    schema {
        query: Query
        mutation: Mutation
    }
`);
