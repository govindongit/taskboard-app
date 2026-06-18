import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { setContext } from "@apollo/client/link/context";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";

// ... rest of the file is unchanged

// createHttpLink tells Apollo where to send GraphQL requests
const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

// setContext runs before EVERY request — this is where we attach the JWT token
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers, // Keep existing headers, don't overwrite them
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Apollo Client: combine auth + http links
// InMemoryCache stores results — repeated queries don't always refetch
const client = new ApolloClient({
  link: authLink.concat(httpLink), // authLink runs first, then httpLink
  cache: new InMemoryCache(),
});

// The order of providers matters — each wraps the next
// BrowserRouter → ApolloProvider → AuthProvider → App
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloProvider client={client}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
