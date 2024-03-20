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

    type AuthData {
        token: String!
        userId: String!
    }

    input UserDataInput {
        email: String!
        name: String!
        password: String!
    }

    input PostDataInput {
        title: String!
        content: String!
        imageUrl: String!
    }

    type Query {
        login(email: String!, password: String!): AuthData!
    }

    type Mutation {
        createUser(userInput: UserDataInput): User!
        createPost(postInput: PostDataInput): Post!
    }

    schema {
        query: Query
        mutation: Mutation
    }
`);
