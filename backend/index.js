const express = require("express");
const http = require("http");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Must be first — loads .env into process.env

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const getUser = require("./middleware/auth");

async function startServer() {
  const app = express();

  // Apollo Server 5 needs an explicit http.Server instance so it can
  // "drain" it (finish in-flight requests) during a graceful shutdown
  const httpServer = http.createServer(app);

  // --- APOLLO (GRAPHQL) SERVER ---
  // Note: typeDefs and resolvers are passed here exactly as before —
  // this part of the API didn't change between Apollo Server versions
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  // You must start the Apollo Server before attaching it to Express
  await apolloServer.start();

  // --- MIDDLEWARE ---
  // These run on every request, in order, before reaching the resolvers
  // Like WordPress hooks — they intercept the request

  app.use(
    "/graphql",

    // Allow requests from our React app on port 5173
    cors({ origin: "http://localhost:5173", credentials: true }),

    // Parse JSON request bodies
    express.json(),

    // expressMiddleware wires the Apollo Server instance into this Express route
    // context runs on every request — its return value becomes the 3rd argument
    // available in every resolver function
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const user = getUser(req); // Decode JWT → user data or null
        return { user }; // { user: { id, email } } or { user: null }
      },
    }),
  );

  // --- CONNECT TO MONGODB ---
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }

  // --- START SERVER ---
  // Note: we listen on httpServer now, not app directly —
  // this is what lets ApolloServerPluginDrainHttpServer do its job
  const PORT = process.env.PORT || 4000;
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`Server running at http://localhost:${PORT}/graphql`);
}

startServer();
