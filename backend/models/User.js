const mongoose = require("mongoose");

// A Schema defines the shape of a MongoDB document
// Like a MySQL table definition, but for JSON documents
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // Field must exist
      unique: true, // No duplicates allowed
      trim: true, // Strips leading/trailing whitespace
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Stores "User@Email.com" as "user@email.com"
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true, // Auto-adds createdAt and updatedAt
  },
);

// Model is the class you use to query: User.find(), User.create(), etc.
const User = mongoose.model("User", userSchema);
module.exports = User;
