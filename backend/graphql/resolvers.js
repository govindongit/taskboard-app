const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Task = require("../models/Task");

// Resolvers are functions that execute each GraphQL operation
// Think of them as controller functions in MVC

const resolvers = {
  // --- QUERY RESOLVERS (Read operations) ---
  Query: {
    // context is a shared object passed to every resolver
    // We use it to carry the authenticated user's data
    getTasks: async (_, __, context) => {
      if (!context.user) throw new Error("Not authenticated");

      // Find all tasks that belong to this user, newest first
      const tasks = await Task.find({ user: context.user.id }).sort({
        createdAt: -1,
      });
      return tasks;
    },

    getTask: async (_, { id }, context) => {
      if (!context.user) throw new Error("Not authenticated");
      const task = await Task.findOne({ _id: id, user: context.user.id });
      if (!task) throw new Error("Task not found");
      return task;
    },

    getUser: async (_, __, context) => {
      if (!context.user) throw new Error("Not authenticated");
      return await User.findById(context.user.id);
    },
  },

  // --- MUTATION RESOLVERS (Write operations) ---
  Mutation: {
    register: async (_, { username, email, password }) => {
      // 1. Check for duplicate email
      const existing = await User.findOne({ email });
      if (existing) throw new Error("Email already in use");

      // 2. Hash password before storing
      // bcrypt adds "salt" (random data) and hashes it
      // 12 = cost factor — higher = slower = harder for attackers to crack
      const hashedPassword = await bcrypt.hash(password, 12);

      // 3. Save to MongoDB
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      // 4. Create JWT token — this is what the client stores and sends back on every request
      const token = jwt.sign(
        { id: user._id, email: user.email }, // Payload embedded in the token
        process.env.JWT_SECRET,
        { expiresIn: "7d" }, // Token expires in 7 days
      );

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        token,
      };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error("User not found");

      // bcrypt.compare hashes the submitted password and compares to stored hash
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid password");

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        token,
      };
    },

    createTask: async (_, { title, description }, context) => {
      if (!context.user) throw new Error("Not authenticated");
      const task = await Task.create({
        title,
        description: description || "",
        user: context.user.id, // Links this task to the logged-in user
      });
      return task;
    },

    updateTask: async (_, { id, title, description, status }, context) => {
      if (!context.user) throw new Error("Not authenticated");

      // findOneAndUpdate: atomic find + update in one DB call
      // The query checks BOTH _id and user — prevents users editing others' tasks
      // { new: true } returns the updated doc, not the original
      const task = await Task.findOneAndUpdate(
        { _id: id, user: context.user.id },
        { $set: { title, description, status } }, // $set only updates specified fields
        { new: true },
      );

      if (!task) throw new Error("Task not found or unauthorized");
      return task;
    },

    deleteTask: async (_, { id }, context) => {
      if (!context.user) throw new Error("Not authenticated");
      const result = await Task.deleteOne({ _id: id, user: context.user.id });
      return result.deletedCount === 1;
    },
  },
};

module.exports = resolvers;
