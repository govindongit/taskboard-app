const { gql } = require("graphql-tag");

// gql is a template literal tag that parses this string as a GraphQL schema
// This is your API contract: "here is what data exists and what operations are allowed"
const typeDefs = gql`
  # TYPES — define the shape of your data
  # Like TypeScript interfaces or MySQL table definitions

  type User {
    id: ID! # ! means non-nullable — this field always has a value
    username: String!
    email: String!
    token: String # No ! — only present after login/register
  }

  type Task {
    id: ID!
    title: String!
    description: String
    status: String!
    createdAt: String
  }

  # QUERIES — read operations (like GET in REST)
  type Query {
    getTasks: [Task]! # Returns a list of tasks
    getTask(id: ID!): Task # Returns one task by ID
    getUser: User # Returns current user's profile
  }

  # MUTATIONS — write operations (like POST/PUT/DELETE in REST)
  type Mutation {
    register(username: String!, email: String!, password: String!): User!
    login(email: String!, password: String!): User!

    createTask(title: String!, description: String): Task!
    updateTask(
      id: ID!
      title: String
      description: String
      status: String
    ): Task!
    deleteTask(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
