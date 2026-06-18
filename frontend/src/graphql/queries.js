import { gql } from "@apollo/client"; // unchanged — gql is not a React hook

// These are the GraphQL operations the frontend sends to the backend
// gql parses the string into a format Apollo can send over HTTP

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      id
      username
      email
      token
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      id
      username
      email
      token
    }
  }
`;

export const GET_TASKS_QUERY = gql`
  query GetTasks {
    getTasks {
      id
      title
      description
      status
      createdAt
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($title: String!, $description: String) {
    createTask(title: $title, description: $description) {
      id
      title
      description
      status
      createdAt
    }
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: ID!, $status: String) {
    updateTask(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const DELETE_TASK_MUTATION = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;
