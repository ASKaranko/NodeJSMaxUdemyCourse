const { buildSchema } = require('graphql');

// ! - required
module.exports = buildSchema(`
    type TestData {
        text: String!
        views: Int!
    }

    type Query {
        hello: TestData!
    }
`);
